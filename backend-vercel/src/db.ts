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
    idle_timeout: 20,
    connect_timeout: 10,
  });
}

export const sql = globalThis.__bwevent_sql ?? (globalThis.__bwevent_sql = createClient());
