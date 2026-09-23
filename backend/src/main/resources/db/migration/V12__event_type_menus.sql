-- Per-event-type preset menus (e.g. "Menu Découverte", "Menu Végétarien"),
-- each a named list of dishes staff can define once and reuse. Mirrors the
-- event_type_fields pattern: fully owned by their event type, replaced
-- wholesale on update, never referenced directly by a banquet — picking a
-- preset menu just copies its dishes into that banquet's own menu_items,
-- which stay freely editable afterward.

CREATE TABLE event_type_menus (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type_id   UUID         NOT NULL REFERENCES event_types(id) ON DELETE CASCADE,
    name            VARCHAR(150) NOT NULL,
    description     TEXT,
    display_order   INTEGER      NOT NULL DEFAULT 0
);

CREATE TABLE event_type_menu_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_id         UUID         NOT NULL REFERENCES event_type_menus(id) ON DELETE CASCADE,
    dish_name       VARCHAR(255) NOT NULL,
    description     VARCHAR(500),
    display_order   INTEGER      NOT NULL DEFAULT 0
);

CREATE INDEX idx_event_type_menus_type ON event_type_menus(event_type_id);
CREATE INDEX idx_event_type_menu_items_menu ON event_type_menu_items(menu_id);
