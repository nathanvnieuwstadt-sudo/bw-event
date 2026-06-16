-- Event types: manager-defined categories of events the restaurant can host
CREATE TABLE event_types (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id   UUID         NOT NULL,
    name            VARCHAR(100) NOT NULL,
    description     TEXT,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Per-type custom fields that define what information the agent must collect
CREATE TABLE event_type_fields (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type_id   UUID         NOT NULL REFERENCES event_types(id) ON DELETE CASCADE,
    field_key       VARCHAR(50)  NOT NULL,
    field_label     VARCHAR(100) NOT NULL,
    field_type      VARCHAR(20)  NOT NULL DEFAULT 'TEXT',
    options         TEXT,
    required        BOOLEAN      NOT NULL DEFAULT FALSE,
    display_order   INTEGER      NOT NULL DEFAULT 0
);

-- Values collected for each banquet's custom fields
CREATE TABLE banquet_field_values (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    banquet_id      UUID         NOT NULL REFERENCES banquets(id) ON DELETE CASCADE,
    field_id        UUID         NOT NULL REFERENCES event_type_fields(id) ON DELETE CASCADE,
    value           TEXT,
    UNIQUE (banquet_id, field_id)
);

ALTER TABLE banquets ADD COLUMN event_type_id UUID REFERENCES event_types(id) ON DELETE SET NULL;

CREATE INDEX idx_event_types_restaurant ON event_types(restaurant_id);
CREATE INDEX idx_event_type_fields_type ON event_type_fields(event_type_id);
CREATE INDEX idx_banquet_field_values_banquet ON banquet_field_values(banquet_id);
