package com.bwevent.agent.service;

import com.bwevent.agent.repository.GmailConnectionRepository;
import com.bwevent.domain.model.GmailConnection;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeRequestUrl;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeTokenRequest;
import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
import com.google.api.client.googleapis.auth.oauth2.GoogleTokenResponse;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.HttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.gmail.GmailScopes;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Google OAuth connect/callback/disconnect for a restaurant's Gmail inbox.
 * Requests only gmail.readonly + gmail.send — never gmail.modify — so the
 * "the AI never deletes or archives anything" requirement is enforced at the
 * OAuth-scope level, not just by code review.
 *
 * Known simplification: the OAuth `state` param is the bare restaurantId, not
 * a signed one-time nonce, so this doesn't fully close a CSRF-style trick
 * where an attacker completes their own Google consent and replays the
 * resulting code against our callback with someone else's restaurantId as
 * state. Low-stakes for a single-restaurant internal tool today; worth a
 * proper nonce (state stored server-side at /connect time, checked at
 * /callback) before this app has many independent restaurants.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class GmailConnectionService {

    private static final List<String> SCOPES = List.of(GmailScopes.GMAIL_READONLY, GmailScopes.GMAIL_SEND);
    private static final String APPLICATION_NAME = "bw-event";

    private final GmailConnectionRepository gmailConnectionRepository;
    private final TokenEncryptionService tokenEncryptionService;

    @Value("${app.gmail.client-id:}")
    private String clientId;

    @Value("${app.gmail.client-secret:}")
    private String clientSecret;

    @Value("${app.gmail.redirect-uri:}")
    private String redirectUri;

    public boolean isConfigured() {
        return !isBlank(clientId) && !isBlank(clientSecret) && !isBlank(redirectUri);
    }

    public String buildAuthorizationUrl(UUID restaurantId) {
        requireConfigured();
        return new GoogleAuthorizationCodeRequestUrl(clientId, redirectUri, SCOPES)
                .setAccessType("offline")
                .setApprovalPrompt("force") // always return a refresh token, even on a repeat connect
                .setState(restaurantId.toString())
                .build();
    }

    @Transactional
    public void handleCallback(UUID restaurantId, String authorizationCode) throws IOException, GeneralSecurityException {
        requireConfigured();
        HttpTransport transport = GoogleNetHttpTransport.newTrustedTransport();

        GoogleTokenResponse tokenResponse = new GoogleAuthorizationCodeTokenRequest(
                transport, GsonFactory.getDefaultInstance(), clientId, clientSecret, authorizationCode, redirectUri)
                .execute();

        if (tokenResponse.getRefreshToken() == null) {
            throw new IllegalStateException(
                    "Google did not return a refresh token — the account may already be connected without " +
                            "'approval_prompt=force', or offline access was not granted");
        }

        String gmailEmail = fetchGmailAddress(transport, tokenResponse);
        String encryptedToken = tokenEncryptionService.encrypt(tokenResponse.getRefreshToken());

        GmailConnection connection = gmailConnectionRepository.findByRestaurantId(restaurantId)
                .orElseGet(() -> GmailConnection.builder().restaurantId(restaurantId).build());
        connection.setGmailEmail(gmailEmail);
        connection.setEncryptedRefreshToken(encryptedToken);
        connection.setLastPollStatus(null);
        connection.setLastError(null);
        gmailConnectionRepository.save(connection);
    }

    public GmailConnection findOrThrow(UUID restaurantId) {
        return gmailConnectionRepository.findByRestaurantId(restaurantId)
                .orElseThrow(() -> new EntityNotFoundException("No Gmail connection for restaurant: " + restaurantId));
    }

    @Transactional
    public void disconnect(UUID restaurantId) {
        gmailConnectionRepository.findByRestaurantId(restaurantId).ifPresent(gmailConnectionRepository::delete);
    }

    /** Builds a fresh, auto-refreshing credential from a connection's stored (decrypted) refresh token. */
    public GoogleCredential credentialFor(GmailConnection connection) throws GeneralSecurityException, IOException {
        requireConfigured();
        HttpTransport transport = GoogleNetHttpTransport.newTrustedTransport();
        GoogleCredential credential = new GoogleCredential.Builder()
                .setTransport(transport)
                .setJsonFactory(GsonFactory.getDefaultInstance())
                .setClientSecrets(clientId, clientSecret)
                .build();
        credential.setRefreshToken(tokenEncryptionService.decrypt(connection.getEncryptedRefreshToken()));
        credential.refreshToken();
        return credential;
    }

    private String fetchGmailAddress(HttpTransport transport, GoogleTokenResponse tokenResponse)
            throws GeneralSecurityException, IOException {
        GoogleCredential credential = new GoogleCredential.Builder()
                .setTransport(transport)
                .setJsonFactory(GsonFactory.getDefaultInstance())
                .setClientSecrets(clientId, clientSecret)
                .build();
        credential.setAccessToken(tokenResponse.getAccessToken());
        com.google.api.services.gmail.Gmail gmail = new com.google.api.services.gmail.Gmail.Builder(
                transport, GsonFactory.getDefaultInstance(), credential)
                .setApplicationName(APPLICATION_NAME)
                .build();
        return gmail.users().getProfile("me").execute().getEmailAddress();
    }

    private void requireConfigured() {
        if (!isConfigured()) {
            throw new IllegalStateException(
                    "Gmail OAuth is not configured — set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI");
        }
    }

    private boolean isBlank(String s) {
        return s == null || s.isBlank();
    }
}
