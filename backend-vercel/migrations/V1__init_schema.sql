-- V1: Initial schema

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- restaurants
CREATE TABLE restaurants (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255) NOT NULL,
    agent_mode  VARCHAR(20)  NOT NULL DEFAULT 'APPROVAL',
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- users
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id   UUID,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    role            VARCHAR(30)  NOT NULL,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- contacts
CREATE TABLE contacts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id   UUID         NOT NULL,
    name            VARCHAR(255) NOT NULL,
    email           VARCHAR(255) NOT NULL,
    phone           VARCHAR(50),
    organization    VARCHAR(255),
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- banquets
CREATE TABLE banquets (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id           UUID         NOT NULL,
    contact_id              UUID         REFERENCES contacts(id) ON DELETE SET NULL,
    status                  VARCHAR(20)  NOT NULL DEFAULT 'DRAFT',
    source                  VARCHAR(20)  NOT NULL DEFAULT 'MANUAL',
    event_date              DATE,
    start_time              TIME,
    end_time                TIME,
    headcount               INTEGER,
    budget                  NUMERIC(10,2),
    room_setup              VARCHAR(255),
    dietary_restrictions    TEXT,
    av_needs                TEXT,
    deposit_paid            BOOLEAN      NOT NULL DEFAULT FALSE,
    deposit_amount          NUMERIC(10,2),
    notes                   TEXT,
    created_by              UUID         REFERENCES users(id) ON DELETE SET NULL,
    created_at              TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- menu_items
CREATE TABLE menu_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id   UUID         NOT NULL,
    banquet_id      UUID         NOT NULL REFERENCES banquets(id) ON DELETE CASCADE,
    dish_name       VARCHAR(255) NOT NULL,
    quantity        INTEGER      NOT NULL,
    notes           VARCHAR(500)
);

-- email_threads (scaffold)
CREATE TABLE email_threads (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id       UUID         NOT NULL,
    banquet_id          UUID         REFERENCES banquets(id) ON DELETE SET NULL,
    gmail_thread_id     VARCHAR(255),
    subject             VARCHAR(500),
    last_message_at     TIMESTAMPTZ,
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- agent_drafts (scaffold)
CREATE TABLE agent_drafts (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id       UUID        NOT NULL,
    email_thread_id     UUID        NOT NULL REFERENCES email_threads(id) ON DELETE CASCADE,
    banquet_id          UUID        REFERENCES banquets(id) ON DELETE SET NULL,
    draft_body          TEXT        NOT NULL,
    status              VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_by         UUID        REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at         TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_banquets_restaurant_date ON banquets(restaurant_id, event_date);
CREATE INDEX idx_banquets_status ON banquets(status);
CREATE INDEX idx_menu_items_banquet ON menu_items(banquet_id);
CREATE INDEX idx_contacts_restaurant ON contacts(restaurant_id);
CREATE INDEX idx_agent_drafts_restaurant_status ON agent_drafts(restaurant_id, status);
