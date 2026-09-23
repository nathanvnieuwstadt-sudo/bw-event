-- Restaurant-wide preset menus (e.g. "Menu Découverte", "Menu Végétarien"),
-- each a named list of dishes staff can define once and reuse. Not owned by
-- any single event type — the same menu is often reused across several.
-- The dish table is named menu_dishes, not menu_items, to avoid colliding
-- with the existing menu_items table (a banquet's actual, freely-edited
-- dish list).

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
