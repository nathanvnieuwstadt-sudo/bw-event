-- V10: foundation for the real AI booking email agent — Gmail connection,
-- ingestion ledger, knowledge base, rule/draft audit trail, and the
-- correction-analysis feedback loop. See CLAUDE.md "Agent Architecture" for
-- the full design; this migration only adds the tables/columns it needs.

-- ── Gmail connection + pipeline health ─────────────────────────────────────

CREATE TABLE gmail_connections (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id           UUID         NOT NULL UNIQUE,
    gmail_email             VARCHAR(255) NOT NULL,
    encrypted_refresh_token TEXT         NOT NULL,
    history_id              VARCHAR(50),
    connected_by            UUID         REFERENCES users(id) ON DELETE SET NULL,
    connected_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    last_poll_at            TIMESTAMPTZ,
    last_poll_status        VARCHAR(20),
    last_error              TEXT
);

CREATE TABLE pipeline_health_events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id   UUID         NOT NULL,
    event_type      VARCHAR(30)  NOT NULL,
    message         TEXT         NOT NULL,
    occurred_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pipeline_health_restaurant ON pipeline_health_events(restaurant_id, occurred_at DESC);

-- ── Ingestion ledger ─────────────────────────────────────────────────────────
-- Every email the poller sees gets a row here regardless of classification,
-- so staff can audit "did we see everything" against the real inbox.

CREATE TABLE processed_emails (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id       UUID         NOT NULL,
    gmail_message_id    VARCHAR(255) NOT NULL,
    gmail_thread_id     VARCHAR(255),
    subject             VARCHAR(500),
    sender_name         VARCHAR(255),
    sender_email        VARCHAR(255),
    received_at         TIMESTAMPTZ,
    classification       VARCHAR(20)  NOT NULL,
    confidence          NUMERIC(3,2),
    email_thread_id     UUID         REFERENCES email_threads(id) ON DELETE SET NULL,
    processed_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_processed_emails_classification
        CHECK (classification IN ('EVENT_REQUEST', 'EVENT_FOLLOWUP', 'NOT_EVENT_RELATED', 'UNCERTAIN')),
    CONSTRAINT uq_processed_emails_message UNIQUE (restaurant_id, gmail_message_id)
);

CREATE INDEX idx_processed_emails_restaurant ON processed_emails(restaurant_id, received_at DESC);

-- ── Knowledge base ───────────────────────────────────────────────────────────
-- Facts the model is allowed to use when drafting — menu items, pricing,
-- policies, deposit terms, capacity limits, blackout dates. structured_value
-- holds anything a programmatic rule check needs to compare against (a price,
-- a date) — content is always the human-readable version shown in the prompt.

CREATE TABLE knowledge_base_entries (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id       UUID         NOT NULL,
    category            VARCHAR(30)  NOT NULL,
    title               VARCHAR(255) NOT NULL,
    content             TEXT         NOT NULL,
    structured_value    JSONB,
    updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_by          UUID         REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT chk_kb_entries_category
        CHECK (category IN ('MENU', 'PRICING', 'POLICY', 'DEPOSIT', 'CAPACITY', 'BLACKOUT_DATE'))
);

CREATE INDEX idx_kb_entries_restaurant ON knowledge_base_entries(restaurant_id, category);

-- ── Rules: extend the existing agent_instructions table ─────────────────────
-- This *is* the "drafting_rules" table — no need for a parallel one.

ALTER TABLE agent_instructions
    ADD COLUMN created_by      UUID REFERENCES users(id) ON DELETE SET NULL,
    ADD COLUMN checkable_type  VARCHAR(30);

-- ── Drafts: extend agent_drafts with the full generation + review audit trail

ALTER TABLE agent_drafts
    ADD COLUMN classification         VARCHAR(20),
    ADD COLUMN confidence              NUMERIC(3,2),
    ADD COLUMN generation_prompt       TEXT,
    ADD COLUMN model_raw_output        TEXT,
    ADD COLUMN rules_snapshot          JSONB,
    ADD COLUMN knowledge_base_snapshot JSONB,
    ADD COLUMN rule_violations         JSONB,
    ADD COLUMN final_body              TEXT,
    ADD COLUMN edit_diff               TEXT;

-- A "correction" is just a draft whose approved final_body differs from the
-- original draft_body — no separate corrections table needed.

-- ── Correction-analysis feedback loop ────────────────────────────────────────

CREATE TABLE agent_suggestions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id       UUID         NOT NULL,
    kind                VARCHAR(20)  NOT NULL,
    target_rule_id      UUID         REFERENCES agent_instructions(id) ON DELETE CASCADE,
    target_kb_entry_id  UUID         REFERENCES knowledge_base_entries(id) ON DELETE CASCADE,
    proposed_text       TEXT         NOT NULL,
    rationale           TEXT         NOT NULL,
    evidence            JSONB        NOT NULL,
    status              VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    reviewed_by         UUID         REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at         TIMESTAMPTZ,
    CONSTRAINT chk_suggestions_kind
        CHECK (kind IN ('NEW_RULE', 'EDIT_RULE', 'NEW_KB_ENTRY', 'EDIT_KB_ENTRY')),
    CONSTRAINT chk_suggestions_status
        CHECK (status IN ('PENDING', 'APPROVED', 'EDITED_APPROVED', 'DISMISSED'))
);

CREATE INDEX idx_agent_suggestions_restaurant ON agent_suggestions(restaurant_id, status);

CREATE TABLE agent_analysis_runs (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id           UUID         NOT NULL,
    started_at              TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    finished_at             TIMESTAMPTZ,
    corrections_reviewed    INTEGER      NOT NULL DEFAULT 0,
    suggestions_created     INTEGER      NOT NULL DEFAULT 0,
    status                  VARCHAR(20)  NOT NULL DEFAULT 'RUNNING',
    error                   TEXT
);
