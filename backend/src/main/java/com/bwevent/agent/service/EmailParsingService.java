package com.bwevent.agent.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * Placeholder — will extract banquet fields (date, headcount, contact info etc.)
 * from raw email body text using NLP or Claude API when implemented.
 */
@Service
@Slf4j
public class EmailParsingService {

    public void parseEmail(String rawEmailBody) {
        log.info("EmailParsingService.parseEmail called — not yet implemented");
        throw new UnsupportedOperationException("Email parsing not yet implemented");
    }
}
