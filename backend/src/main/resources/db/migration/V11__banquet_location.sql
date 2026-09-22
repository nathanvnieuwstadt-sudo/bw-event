-- Adds which of the restaurant's 3 physical venues a banquet is booked in.
-- Nullable, no capacity/budget enforcement — just a plain picker for staff.
-- Placeholder location names (MAIN_HALL / PRIVATE_ROOM / TERRACE) — swap the
-- CHECK constraint values (and the frontend LABELS map) for the real venue
-- names whenever convenient.

ALTER TABLE banquets ADD COLUMN location VARCHAR(30);
ALTER TABLE banquets ADD CONSTRAINT chk_banquets_location
  CHECK (location IS NULL OR location IN ('MAIN_HALL', 'PRIVATE_ROOM', 'TERRACE'));
