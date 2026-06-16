package com.bwevent.agent.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * Placeholder — will poll Gmail inbox for new threads when Gmail API integration is implemented.
 * Triggered on a scheduled interval; new threads are handed to EmailParsingService.
 */
@Service
@Slf4j
public class GmailPollingService {

    public void pollInbox(UUID restaurantId) {
        log.info("GmailPollingService.pollInbox called for restaurant {} — not yet implemented", restaurantId);
        throw new UnsupportedOperationException("Gmail integration not yet implemented");
    }
}
