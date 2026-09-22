package com.bwevent.agent.service;

import com.bwevent.agent.repository.EmailThreadRepository;
import com.bwevent.agent.repository.GmailConnectionRepository;
import com.bwevent.agent.repository.PipelineHealthEventRepository;
import com.bwevent.agent.repository.ProcessedEmailRepository;
import com.bwevent.contact.repository.ContactRepository;
import com.bwevent.domain.enums.EmailClassification;
import com.bwevent.domain.model.Contact;
import com.bwevent.domain.model.EmailThread;
import com.bwevent.domain.model.GmailConnection;
import com.bwevent.domain.model.PipelineHealthEvent;
import com.bwevent.domain.model.ProcessedEmail;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.HttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.gmail.Gmail;
import com.google.api.services.gmail.model.ListMessagesResponse;
import com.google.api.services.gmail.model.Message;
import com.google.api.services.gmail.model.MessagePart;
import com.google.api.services.gmail.model.MessagePartHeader;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Base64;
import java.util.List;
import java.util.UUID;

/**
 * Polls each connected restaurant's Gmail inbox for new messages, classifies
 * each one via Claude, and for anything not clearly unrelated to event
 * bookings (EVENT_REQUEST / EVENT_FOLLOWUP / UNCERTAIN) creates an EmailThread
 * + AgentDraft — the same pipeline "Simuler un e-mail" exercises manually.
 * Every message seen is logged to processed_emails regardless of
 * classification, for the "did we see everything" audit (CLAUDE.md).
 * <p>
 * Triggered by GET /cron/agent-poll (CronController), meant to be called by
 * Google Cloud Scheduler — Cloud Run scales to zero, so an in-process
 * {@code @Scheduled} job can't be relied on to fire.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class GmailPollingService {

    private static final String APPLICATION_NAME = "bw-event";
    private static final int MAX_MESSAGES_PER_POLL = 25;

    private final GmailConnectionRepository gmailConnectionRepository;
    private final GmailConnectionService gmailConnectionService;
    private final ProcessedEmailRepository processedEmailRepository;
    private final PipelineHealthEventRepository pipelineHealthEventRepository;
    private final EmailThreadRepository emailThreadRepository;
    private final ContactRepository contactRepository;
    private final ClaudeApiService claudeApiService;
    private final DraftGenerationService draftGenerationService;
    private final DraftCreationService draftCreationService;

    public void pollAllConnectedRestaurants() {
        for (GmailConnection connection : gmailConnectionRepository.findAll()) {
            try {
                pollInbox(connection);
            } catch (Exception e) {
                log.error("Gmail poll failed for restaurant {}", connection.getRestaurantId(), e);
                recordFailure(connection, e.getMessage());
            }
        }
    }

    @Transactional
    public void pollInbox(GmailConnection connection) throws Exception {
        UUID restaurantId = connection.getRestaurantId();
        HttpTransport transport = GoogleNetHttpTransport.newTrustedTransport();
        Gmail gmail = new Gmail.Builder(transport, GsonFactory.getDefaultInstance(),
                gmailConnectionService.credentialFor(connection))
                .setApplicationName(APPLICATION_NAME)
                .build();

        // Simple approach for a first real implementation: list the most recent
        // unread inbox messages rather than walking the History API. Trade-off:
        // relies on messages staying unread until processed, and re-lists on
        // every poll rather than an incremental diff. history_id already exists
        // on gmail_connections for a proper incremental poll as a follow-up once
        // this is proven against a real inbox.
        ListMessagesResponse listResponse = gmail.users().messages().list("me")
                .setLabelIds(List.of("INBOX", "UNREAD"))
                .setMaxResults((long) MAX_MESSAGES_PER_POLL)
                .execute();

        List<Message> messages = listResponse.getMessages();
        int processed = 0;
        if (messages != null) {
            for (Message summary : messages) {
                if (processedEmailRepository.existsByRestaurantIdAndGmailMessageId(restaurantId, summary.getId())) {
                    continue; // already processed on an earlier poll
                }
                Message full = gmail.users().messages().get("me", summary.getId()).setFormat("full").execute();
                processMessage(restaurantId, full);
                processed++;
            }
        }

        connection.setLastPollAt(Instant.now());
        connection.setLastPollStatus("OK");
        connection.setLastError(null);
        gmailConnectionRepository.save(connection);
        log.info("Gmail poll for restaurant {} processed {} new message(s)", restaurantId, processed);
    }

    private void processMessage(UUID restaurantId, Message message) {
        String subject = header(message, "Subject");
        String from = header(message, "From");
        String senderEmail = extractEmail(from);
        String senderName = extractDisplayName(from);
        String body = extractPlainTextBody(message.getPayload());
        Instant receivedAt = message.getInternalDate() != null
                ? Instant.ofEpochMilli(message.getInternalDate()) : Instant.now();

        ClaudeApiService.ClassificationResult classification =
                claudeApiService.classify(subject, body != null ? body : "");

        UUID emailThreadId = null;
        if (classification.classification() != EmailClassification.NOT_EVENT_RELATED) {
            Contact contact = senderEmail != null
                    ? contactRepository.findAllByRestaurantIdOrderByNameAsc(restaurantId).stream()
                            .filter(c -> senderEmail.equalsIgnoreCase(c.getEmail()))
                            .findFirst().orElse(null)
                    : null;

            EmailThread thread = EmailThread.builder()
                    .restaurantId(restaurantId)
                    .contact(contact)
                    .senderName(contact == null ? senderName : null)
                    .senderEmail(senderEmail)
                    .subject(subject)
                    .lastMessageAt(receivedAt)
                    .lastMessageBody(body)
                    .build();
            thread = emailThreadRepository.save(thread);
            emailThreadId = thread.getId();

            String contactName = contact != null ? contact.getName() : senderName;
            DraftGenerationService.Result result = draftGenerationService.generate(
                    restaurantId, contactName, subject, body != null ? body : "");
            DraftCreationService.DraftMeta meta = new DraftCreationService.DraftMeta(
                    classification.classification(),
                    classification.confidence(),
                    result.meta() != null ? result.meta().generationPrompt() : null,
                    result.meta() != null ? result.meta().modelRawOutput() : null,
                    result.meta() != null ? result.meta().rulesSnapshot() : null,
                    result.meta() != null ? result.meta().knowledgeBaseSnapshot() : null);
            draftCreationService.createDraft(restaurantId, thread, result.draftBody(), meta);
        }

        ProcessedEmail processedEmail = ProcessedEmail.builder()
                .restaurantId(restaurantId)
                .gmailMessageId(message.getId())
                .gmailThreadId(message.getThreadId())
                .subject(subject)
                .senderName(senderName)
                .senderEmail(senderEmail)
                .receivedAt(receivedAt)
                .classification(classification.classification())
                .confidence(BigDecimal.valueOf(classification.confidence()))
                .emailThreadId(emailThreadId)
                .build();
        processedEmailRepository.save(processedEmail);
    }

    private void recordFailure(GmailConnection connection, String message) {
        connection.setLastPollAt(Instant.now());
        connection.setLastPollStatus("ERROR");
        connection.setLastError(message);
        gmailConnectionRepository.save(connection);

        pipelineHealthEventRepository.save(PipelineHealthEvent.builder()
                .restaurantId(connection.getRestaurantId())
                .eventType("POLL_ERROR")
                .message(message != null ? message : "Unknown error")
                .build());
    }

    private String header(Message message, String name) {
        if (message.getPayload() == null || message.getPayload().getHeaders() == null) return null;
        return message.getPayload().getHeaders().stream()
                .filter(h -> name.equalsIgnoreCase(h.getName()))
                .map(MessagePartHeader::getValue)
                .findFirst().orElse(null);
    }

    private String extractEmail(String fromHeader) {
        if (fromHeader == null) return null;
        int lt = fromHeader.indexOf('<');
        int gt = fromHeader.indexOf('>');
        if (lt >= 0 && gt > lt) return fromHeader.substring(lt + 1, gt).trim();
        return fromHeader.trim();
    }

    private String extractDisplayName(String fromHeader) {
        if (fromHeader == null) return null;
        int lt = fromHeader.indexOf('<');
        if (lt > 0) {
            return fromHeader.substring(0, lt).trim().replaceAll("^\"|\"$", "");
        }
        return null;
    }

    /** Walks the MIME tree for the first text/plain part; base64url-decodes its body. */
    private String extractPlainTextBody(MessagePart part) {
        if (part == null) return null;
        if ("text/plain".equalsIgnoreCase(part.getMimeType()) && part.getBody() != null
                && part.getBody().getData() != null) {
            return new String(Base64.getUrlDecoder().decode(part.getBody().getData()));
        }
        if (part.getParts() != null) {
            for (MessagePart child : part.getParts()) {
                String found = extractPlainTextBody(child);
                if (found != null) return found;
            }
        }
        // No text/plain part found — fall back to this part's own body if it has
        // one (covers simple non-multipart messages, e.g. a bare text/html part).
        if (part.getParts() == null && part.getBody() != null && part.getBody().getData() != null) {
            return new String(Base64.getUrlDecoder().decode(part.getBody().getData()));
        }
        return null;
    }
}
