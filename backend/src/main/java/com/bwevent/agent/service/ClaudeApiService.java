package com.bwevent.agent.service;

import com.bwevent.eventtype.dto.EventTypeResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * Placeholder — will call the Anthropic Claude API to generate a reply draft.
 * API key injected from Secret Manager via env var CLAUDE_API_KEY.
 *
 * When implemented, the prompt will include:
 *   1. The full email thread text.
 *   2. A list of known event types with their required fields, so the model can
 *      classify the enquiry and know exactly what information to request.
 *   3. Any banquet context already captured (date, headcount, etc.).
 *
 * Example prompt structure (pseudocode):
 *   system: "You manage bookings for a restaurant. Event types you host:\n
 *            {eventTypes.map(et -> et.name + ": " + et.fields.map(f -> f.fieldLabel).join(", "))}
 *            Classify the enquiry, then reply asking only for missing required fields."
 *   user:   {emailThread}
 */
@Service
@Slf4j
public class ClaudeApiService {

    public String generateReplyDraft(String emailThread, String banquetContext) {
        log.info("ClaudeApiService.generateReplyDraft called — not yet implemented");
        throw new UnsupportedOperationException("Claude API integration not yet implemented");
    }

    public String generateReplyDraftWithEventTypes(
            String emailThread,
            String banquetContext,
            java.util.List<EventTypeResponse> eventTypes) {
        log.info("ClaudeApiService.generateReplyDraftWithEventTypes called — not yet implemented");
        throw new UnsupportedOperationException("Claude API integration not yet implemented");
    }
}
