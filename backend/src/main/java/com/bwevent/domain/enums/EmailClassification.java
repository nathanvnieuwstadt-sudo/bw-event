package com.bwevent.domain.enums;

public enum EmailClassification {
    EVENT_REQUEST,
    EVENT_FOLLOWUP,
    NOT_EVENT_RELATED,
    /** Confidence below threshold — routed to human review, never dropped. */
    UNCERTAIN
}
