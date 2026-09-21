package com.bwevent.domain.enums;

/**
 * The small, fixed set of rule shapes the post-generation validator can
 * actually check against source data (see AgentInstruction.checkableType).
 * Most rules staff write in plain language don't reduce to one of these and
 * stay prompt-only — that's deliberate, not a gap to "eventually" close.
 */
public enum CheckableRuleType {
    /** Flags any price mentioned in the draft that isn't in the knowledge base. */
    NO_UNLISTED_PRICE,
    /** Flags a confirmed date that falls on a blackout_date knowledge-base entry. */
    NO_BLACKOUT_DATE_CONFIRMATION
}
