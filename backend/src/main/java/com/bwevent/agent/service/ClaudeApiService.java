package com.bwevent.agent.service;

import com.anthropic.client.AnthropicClient;
import com.anthropic.client.okhttp.AnthropicOkHttpClient;
import com.anthropic.errors.AnthropicServiceException;
import com.anthropic.errors.RateLimitException;
import com.anthropic.errors.UnauthorizedException;
import com.anthropic.models.messages.Message;
import com.anthropic.models.messages.MessageCreateParams;
import com.anthropic.models.messages.StopReason;
import com.bwevent.domain.enums.EmailClassification;
import com.bwevent.domain.model.AgentInstruction;
import com.bwevent.domain.model.KnowledgeBaseEntry;
import com.bwevent.eventtype.dto.EventTypeResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Real calls to the Claude API. Requires app.claude.api-key (CLAUDE_API_KEY);
 * with no key configured, or on any API failure (auth, rate limit, refusal),
 * methods return null / EmailClassification.UNCERTAIN rather than throwing, so
 * callers can fall back to MockDraftGenerator (drafts) or the safe default
 * (classification) without the request failing. Mirrors the prompt shape in
 * backend-vercel/src/modules/agent/claudeApiService.ts, plus a classify() step
 * that backend-vercel doesn't need (its intake is always pre-filtered by a
 * human clicking "Simuler un e-mail").
 */
@Service
@Slf4j
public class ClaudeApiService {

    private static final String MODEL = "claude-opus-5";
    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Value("${app.claude.api-key:}")
    private String apiKey;

    private AnthropicClient client;
    private boolean clientInitialized = false;

    public record ClassificationResult(EmailClassification classification, double confidence) {
        static ClassificationResult uncertain() {
            return new ClassificationResult(EmailClassification.UNCERTAIN, 0.0);
        }
    }

    private synchronized AnthropicClient getClient() {
        if (!clientInitialized) {
            client = (apiKey != null && !apiKey.isBlank())
                    ? AnthropicOkHttpClient.builder().apiKey(apiKey).build()
                    : null;
            clientInitialized = true;
        }
        return client;
    }

    public boolean isConfigured() {
        return getClient() != null;
    }

    /**
     * Classifies an inbound email so the ingestion pipeline knows whether to
     * draft a reply. Never throws — any failure (no key, auth error, rate
     * limit, refusal, unparseable response) returns UNCERTAIN with confidence
     * 0, which routes the email to human review rather than silently dropping
     * it. Confidence is the model's own self-reported estimate, not a
     * calibrated probability — see CLAUDE.md's honest-limitation note.
     */
    public ClassificationResult classify(String subject, String messageBody) {
        AnthropicClient anthropic = getClient();
        if (anthropic == null) return ClassificationResult.uncertain();

        String system = """
                You classify inbound emails to a restaurant's banquet/private-event booking inbox \
                into exactly one of: EVENT_REQUEST, EVENT_FOLLOWUP, NOT_EVENT_RELATED, UNCERTAIN.

                - EVENT_REQUEST: a new inquiry about booking a private event or banquet.
                - EVENT_FOLLOWUP: relates to an existing or ongoing booking conversation.
                - NOT_EVENT_RELATED: clearly unrelated to event bookings (spam, newsletters, unrelated business).
                - UNCERTAIN: you are not confident which of the above applies.

                If you are at all unsure, prefer UNCERTAIN with a low confidence rather than guessing \
                — a human always reviews UNCERTAIN items, so it is always the safe choice when in doubt.

                Respond with ONLY a single JSON object, no other text, no markdown code fences, in \
                exactly this shape: {"classification": "EVENT_REQUEST", "confidence": 0.0}""";

        String userMessage = "Subject: " + (subject != null ? subject : "(no subject)") + "\n\n" + messageBody;

        try {
            MessageCreateParams params = MessageCreateParams.builder()
                    .model(MODEL)
                    .maxTokens(256L)
                    .system(system)
                    .addUserMessage(userMessage)
                    .build();
            Message response = anthropic.messages().create(params);

            if (response.stopReason().isPresent() && response.stopReason().get().equals(StopReason.REFUSAL)) {
                log.warn("Claude declined to classify an email");
                return ClassificationResult.uncertain();
            }

            String text = extractText(response).orElse(null);
            if (text == null) return ClassificationResult.uncertain();

            return parseClassification(text);
        } catch (UnauthorizedException e) {
            log.error("Claude API authentication failed — check CLAUDE_API_KEY", e);
            return ClassificationResult.uncertain();
        } catch (RateLimitException e) {
            log.error("Claude API rate limited", e);
            return ClassificationResult.uncertain();
        } catch (AnthropicServiceException e) {
            log.error("Claude API error", e);
            return ClassificationResult.uncertain();
        }
    }

    /**
     * Drafts a reply, constrained by the restaurant's event types, enabled
     * house rules, and knowledge base. Returns null (never throws) on any
     * failure so callers fall back to MockDraftGenerator.
     */
    public String generateReplyDraft(
            String contactName,
            String subject,
            String messageBody,
            List<EventTypeResponse> eventTypes,
            List<AgentInstruction> instructions,
            List<KnowledgeBaseEntry> knowledgeBaseEntries) {
        AnthropicClient anthropic = getClient();
        if (anthropic == null) return null;

        String userMessage = String.join("\n",
                subject != null ? "Subject: " + subject : "",
                contactName != null ? "From: " + contactName : "",
                "",
                messageBody);

        try {
            MessageCreateParams params = MessageCreateParams.builder()
                    .model(MODEL)
                    .maxTokens(2048L)
                    .system(buildSystemPrompt(eventTypes, instructions, knowledgeBaseEntries))
                    .addUserMessage(userMessage)
                    .build();
            Message response = anthropic.messages().create(params);

            if (response.stopReason().isPresent() && response.stopReason().get().equals(StopReason.REFUSAL)) {
                log.warn("Claude declined to draft a reply", response.stopDetails().orElse(null));
                return null;
            }

            return extractText(response).map(String::trim).orElse(null);
        } catch (UnauthorizedException e) {
            log.error("Claude API authentication failed — check CLAUDE_API_KEY", e);
            return null;
        } catch (RateLimitException e) {
            log.error("Claude API rate limited", e);
            return null;
        } catch (AnthropicServiceException e) {
            log.error("Claude API error", e);
            return null;
        }
    }

    private Optional<String> extractText(Message response) {
        return response.content().stream()
                .flatMap(block -> block.text().stream())
                .map(com.anthropic.models.messages.TextBlock::text)
                .findFirst();
    }

    private ClassificationResult parseClassification(String text) {
        try {
            String cleaned = text.strip();
            if (cleaned.startsWith("```")) {
                cleaned = cleaned.replaceAll("^```[a-zA-Z]*\\n?", "").replaceAll("```$", "").strip();
            }
            JsonNode node = MAPPER.readTree(cleaned);
            String classificationStr = node.path("classification").asText("UNCERTAIN");
            double confidence = node.path("confidence").asDouble(0.0);
            confidence = Math.max(0.0, Math.min(1.0, confidence));

            EmailClassification classification;
            try {
                classification = EmailClassification.valueOf(classificationStr);
            } catch (IllegalArgumentException e) {
                return ClassificationResult.uncertain();
            }
            return new ClassificationResult(classification, confidence);
        } catch (Exception e) {
            log.warn("Could not parse Claude's classification response, defaulting to UNCERTAIN: {}", text);
            return ClassificationResult.uncertain();
        }
    }

    // House rules go first and are framed as non-negotiable, so they win over the
    // generic guidance below rather than getting diluted by it — mirrors
    // claudeApiService.ts's buildSystemPrompt, which fixed exactly this dilution
    // bug once. Knowledge base is new here (backend-vercel has no equivalent).
    // Package-visible (not private) so DraftGenerationService can reconstruct the
    // exact prompt text for the generation_prompt audit-trail column without this
    // service needing to change its return type just to carry the prompt back.
    String buildSystemPrompt(
            List<EventTypeResponse> eventTypes,
            List<AgentInstruction> instructions,
            List<KnowledgeBaseEntry> knowledgeBaseEntries) {
        StringBuilder sb = new StringBuilder();
        sb.append("You manage banquet and private-event bookings for a restaurant. You are drafting a reply to an ")
                .append("inbound enquiry email on the restaurant's behalf, for a staff member to review before sending.");

        if (instructions != null && !instructions.isEmpty()) {
            sb.append("\n\nMANDATORY HOUSE RULES — apply every one of these that is relevant to this email. They are ")
                    .append("specific requirements from this restaurant's staff and always take priority over the general ")
                    .append("guidance further below:");
            for (int i = 0; i < instructions.size(); i++) {
                AgentInstruction rule = instructions.get(i);
                sb.append("\n").append(i + 1).append(". ").append(rule.getTitle()).append(": ").append(rule.getInstruction());
            }
        }

        sb.append("\n\nGeneral guidance (use this to fill in anything the house rules above don't cover):")
                .append("\n- Reply in the same language the enquiry was written in.")
                .append("\n- Keep it warm, professional, and concise — a real email a person would send, not a form letter.")
                .append("\n- If no house rule above specifies a sign-off, sign off simply and warmly without inventing a ")
                .append("specific team or restaurant name.")
                .append("\n- Do not invent specific prices, dates, availability, or policies beyond what is given to you ")
                .append("below in the knowledge base — if something isn't listed there, don't state it as fact.")
                .append("\n- Output only the email body text. No subject line, no commentary, no markdown formatting.");

        if (eventTypes != null && !eventTypes.isEmpty()) {
            sb.append("\n\nEvent types this restaurant hosts, and the information staff need collected for each:");
            for (EventTypeResponse et : eventTypes) {
                String labels = et.getFields() == null ? "" : String.join(", ",
                        et.getFields().stream().map(f -> f.getFieldLabel()).toList());
                sb.append("\n- ").append(et.getName());
                if (!labels.isBlank()) sb.append(": ").append(labels);
            }
        }

        if (knowledgeBaseEntries != null && !knowledgeBaseEntries.isEmpty()) {
            sb.append("\n\nKnowledge base — facts you may draw on when replying (do not state anything as fact beyond ")
                    .append("what's here):");
            for (KnowledgeBaseEntry entry : knowledgeBaseEntries) {
                sb.append("\n[").append(entry.getCategory()).append("] ").append(entry.getTitle())
                        .append(": ").append(entry.getContent());
            }
        }

        if (instructions != null && !instructions.isEmpty()) {
            sb.append("\n\nBefore finalizing your reply, check it against each numbered house rule above and adjust ")
                    .append("anything it missed.");
        }

        return sb.toString();
    }
}
