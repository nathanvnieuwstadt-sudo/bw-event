-- Adds which of the restaurant's 3 physical venues a banquet is booked in:
-- Étage (FLOOR), Bar (BAR), Comptoir (COUNTER). Nullable, no capacity/budget
-- enforcement — just a plain picker for staff.

ALTER TABLE banquets ADD COLUMN location VARCHAR(30);
ALTER TABLE banquets ADD CONSTRAINT chk_banquets_location
  CHECK (location IS NULL OR location IN ('FLOOR', 'BAR', 'COUNTER'));
