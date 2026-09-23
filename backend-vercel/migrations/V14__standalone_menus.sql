-- Menus turned out not to belong to a single event type — a restaurant
-- reuses the same menu across several event types (or none in particular).
-- Replaces the event_type_menus/event_type_menu_items pair added in V13
-- (shipped minutes earlier, no real data yet) with a restaurant-scoped
-- "menus" entity that isn't owned by anything else. The dish table is named
-- menu_dishes, not menu_items, to avoid colliding with the existing
-- menu_items table (a banquet's actual, freely-edited dish list).

DROP TABLE IF EXISTS event_type_menu_items;
DROP TABLE IF EXISTS event_type_menus;

CREATE TABLE menus (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id   UUID         NOT NULL,
    name            VARCHAR(150) NOT NULL,
    description     TEXT,
    display_order   INTEGER      NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE menu_dishes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_id         UUID         NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
    dish_name       VARCHAR(255) NOT NULL,
    description     VARCHAR(500),
    display_order   INTEGER      NOT NULL DEFAULT 0
);

CREATE INDEX idx_menus_restaurant ON menus(restaurant_id);
CREATE INDEX idx_menu_dishes_menu ON menu_dishes(menu_id);

ALTER TABLE menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_dishes ENABLE ROW LEVEL SECURITY;
