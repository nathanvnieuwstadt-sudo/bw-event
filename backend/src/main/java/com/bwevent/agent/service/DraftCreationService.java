package com.bwevent.agent.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * Placeholder — will persist an AgentDraft with PENDING status and
 * notify the floor manager (via WebSocket or push) when implemented.
 * In AUTONOMOUS mode (per restaurant setting) it will skip the review step and call GmailPollingService to send directly.
 */
@Service
@Slf4j
public class DraftCreationService {

    public void createDraft(UUID restaurantId, UUID emailThreadId, String draftBody) {
        log.info("DraftCreationService.createDraft called — not yet implemented");
        throw new UnsupportedOperationException("Draft creation not yet implemented");
    }
}
