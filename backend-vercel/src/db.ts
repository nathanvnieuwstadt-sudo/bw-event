import postgres from "postgres";
import { env } from "./env.js";

// Reuse the connection across warm serverless invocations.
declare global {
  // eslint-disable-next-line no-var
  var __bwevent_sql: ReturnType<typeof postgres> | undefined;
}

function createClient() {
  return postgres(env.databaseUrl, {
    // Supabase's transaction-mode pooler (pgbouncer) doesn't support
    // server-side prepared statements, so they must be disabled.
    prepare: false,
    ssl: "require",
    max: 5,
    idle_timeout: 60,
    connect_timeout: 10,
    // The schema has no custom enum/domain/composite types, so skip the
    // pg_type/pg_attribute/pg_range introspection query postgres.js would
    // otherwise run on every fresh connection — on Supabase that query
    // scans thousands of catalog rows and was a major source of avoidable
    // disk IO given how often serverless cold starts open new connections.
    fetch_types: false,
  });
}

export const sql = globalThis.__bwevent_sql ?? (globalThis.__bwevent_sql = createClient());
