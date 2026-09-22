-- V11 shipped with placeholder location names (MAIN_HALL/PRIVATE_ROOM/TERRACE).
-- Swapping for the restaurant's real 3 venues. No data migration needed — no
-- banquet had a location set yet (verified: all NULL) when this was written.

ALTER TABLE banquets DROP CONSTRAINT chk_banquets_location;
ALTER TABLE banquets ADD CONSTRAINT chk_banquets_location
  CHECK (location IS NULL OR location IN ('FLOOR', 'BAR', 'COUNTER'));
