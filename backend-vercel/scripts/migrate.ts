import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import postgres from "postgres";
import { env } from "../src/env.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.join(__dirname, "..", "migrations");

const sql = postgres(env.databaseUrl, { prepare: false, ssl: "require", max: 1 });

async function main() {
  await sql`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`;

  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  const appliedRows = await sql<{ version: string }[]>`SELECT version FROM schema_migrations`;
  const applied = new Set(appliedRows.map((r) => r.version));

  for (const file of files) {
    if (applied.has(file)) {
      console.log(`skip  ${file} (already applied)`);
      continue;
    }
    console.log(`apply ${file}`);
    const contents = readFileSync(path.join(migrationsDir, file), "utf8");
    await sql.begin(async (tx) => {
      await tx.unsafe(contents);
      await tx`INSERT INTO schema_migrations (version) VALUES (${file})`;
    });
  }

  console.log("Migrations up to date.");
  await sql.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
