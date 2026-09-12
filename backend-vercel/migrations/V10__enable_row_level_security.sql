-- Enables Row Level Security on every table. This is Supabase-specific and
-- is NOT mirrored to the Java backend's Flyway migrations — see below.
--
-- This backend connects to Postgres as the `postgres` role (backend-vercel/src/db.ts),
-- which has BYPASSRLS and is therefore completely unaffected by this change:
-- every query this app makes keeps working exactly as before.
--
-- What this closes off is Supabase's built-in PostgREST API, which is exposed
-- at /rest/v1 for every Supabase project regardless of whether the app uses
-- it. Without RLS, the `anon` and `authenticated` roles PostgREST runs as
-- have unrestricted read/write access to every row in every table below, to
-- anyone holding this project's anon key. This app was never meant to be
-- queried through PostgREST (see backend-vercel/src/db.ts), so the correct
-- policy for those roles is "no access at all" — which is exactly what
-- enabling RLS with zero policies gives by default.
--
-- Not mirrored to backend/src/main/resources/db/migration/: the
-- anon/authenticated/service_role roles this guards against are created by
-- the Supabase platform and don't exist on the Java backend's plain Cloud
-- SQL instance, so there is nothing there to close off.

ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE banquets ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_type_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE banquet_field_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_instructions ENABLE ROW LEVEL SECURITY;
ALTER TABLE schema_migrations ENABLE ROW LEVEL SECURITY;
