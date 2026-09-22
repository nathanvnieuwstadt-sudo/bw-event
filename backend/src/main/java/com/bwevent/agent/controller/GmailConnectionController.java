package com.bwevent.agent.controller;

import com.bwevent.agent.dto.GmailConnectionResponse;
import com.bwevent.agent.repository.GmailConnectionRepository;
import com.bwevent.agent.service.GmailConnectionService;
import com.bwevent.config.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.method.P;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@Slf4j
public class GmailConnectionController {

    private final GmailConnectionService gmailConnectionService;
    private final GmailConnectionRepository gmailConnectionRepository;

    @GetMapping("/restaurants/{restaurantId}/agent/gmail/status")
    @PreAuthorize("hasAnyRole('DEV', 'GENERAL_MANAGER') and @tenantGuard.check(#restaurantId)")
    public ResponseEntity<ApiResponse<GmailConnectionResponse>> status(@PathVariable @P("restaurantId") UUID restaurantId) {
        GmailConnectionResponse response = gmailConnectionRepository.findByRestaurantId(restaurantId)
                .map(GmailConnectionResponse::from)
                .orElseGet(GmailConnectionResponse::disconnected);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/restaurants/{restaurantId}/agent/gmail/connect")
    @PreAuthorize("hasAnyRole('DEV', 'GENERAL_MANAGER') and @tenantGuard.check(#restaurantId)")
    public ResponseEntity<ApiResponse<String>> connect(@PathVariable @P("restaurantId") UUID restaurantId) {
        return ResponseEntity.ok(ApiResponse.success(gmailConnectionService.buildAuthorizationUrl(restaurantId)));
    }

    /**
     * Google redirects the browser here after consent — one fixed URL registered
     * in Google Cloud Console, not restaurant-scoped in the path (OAuth redirect
     * URIs must be pre-registered exactly, so per-restaurant paths won't work).
     * The restaurant is identified by the `state` param set in connect() above.
     * Unauthenticated by design (see SecurityConfig) — Google calls this directly.
     */
    @GetMapping(value = "/agent/gmail/callback", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> callback(
            @RequestParam("code") String code,
            @RequestParam("state") String state) {
        UUID restaurantId;
        try {
            restaurantId = UUID.fromString(state);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("<p>Invalid state parameter.</p>");
        }
        try {
            gmailConnectionService.handleCallback(restaurantId, code);
            return ResponseEntity.ok("<p>Gmail connected. You can close this tab.</p>");
        } catch (Exception e) {
            log.error("Gmail OAuth callback failed for restaurant {}", restaurantId, e);
            return ResponseEntity.internalServerError()
                    .body("<p>Could not connect Gmail: " + e.getMessage() + "</p>");
        }
    }

    @DeleteMapping("/restaurants/{restaurantId}/agent/gmail/connection")
    @PreAuthorize("hasAnyRole('DEV', 'GENERAL_MANAGER') and @tenantGuard.check(#restaurantId)")
    public ResponseEntity<Void> disconnect(@PathVariable @P("restaurantId") UUID restaurantId) {
        gmailConnectionService.disconnect(restaurantId);
        return ResponseEntity.noContent().build();
    }
}
