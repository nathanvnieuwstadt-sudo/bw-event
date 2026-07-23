# bwevent backend (Vercel + Supabase)

A drop-in replacement for the Spring Boot backend in `../backend`, built to run as
Vercel serverless functions against a Supabase Postgres database. It implements
the exact same API contract (routes, JSON envelope, JWT claims, bcrypt password
hashes) as the Java backend, so `../frontend` works against it unmodified.

Stack: [Hono](https://hono.dev) (routing) + [postgres.js](https://github.com/porsager/postgres)
(DB driver, no ORM) + `jsonwebtoken` / `bcryptjs` (auth) + `zod` (validation).

## Deploy

### 1. Create the Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. In **Project Settings → Database → Connection string**, copy the
   **Transaction pooler** connection string (port 6543) — required for
   serverless: Postgres direct connections don't survive Vercel's
   connection churn, the pooler does.
3. Apply the schema:

   ```bash
   cd backend-vercel
   npm install
   DATABASE_URL="<transaction-pooler-url>" npm run migrate
   ```

   This runs `migrations/V1..V8` in order (identical SQL to the Flyway
   migrations in `../backend`) and tracks what's applied in a
   `schema_migrations` table, so re-running is safe.

### 2. Deploy to Vercel

1. `vercel link` this directory as its own Vercel project (separate from the
   frontend's project — they deploy independently).
2. Set environment variables on the Vercel project:
   - `DATABASE_URL` — the same Supabase transaction-pooler string
   - `JWT_SECRET` — a long random string (must match across deploys; rotating
     it invalidates all issued tokens)
   - `JWT_EXPIRATION_MS` — optional, defaults to `86400000` (24h)
3. `vercel deploy --prod`.

Your API is now live at `https://<project>.vercel.app/api/v1/...`.

### 3. Point the frontend at it

In the frontend's Vercel project (or `.env`), set:

```
VITE_API_BASE_URL=https://<backend-project>.vercel.app
```

The frontend's `api/client.ts` already appends `/api/v1` itself.

## Local development

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL / JWT_SECRET
npm run migrate
vercel dev              # runs the functions locally, or use your own Node harness
```

## Notes / deliberate deviations from the Java backend

- **401 vs 403 on missing/invalid token.** Spring Security's default entry
  point returns a bare 403 with no body when a request has no (or an
  invalid) JWT. This backend returns `401` with the standard error envelope
  instead, which matches what the frontend's axios interceptor
  (`api/client.ts`) already expects to trigger auto-logout on. Role
  mismatches (valid token, wrong role) still return `403`.
- **No ORM.** Queries are hand-written parameterized SQL via postgres.js,
  matching the existing schema table/column names 1:1. This keeps cold
  starts low on serverless and avoids Prisma's binary engine overhead.
- **Multi-tenancy stub preserved.** As in the Java backend, `restaurantId` on
  each row is not yet enforced against the JWT's `restaurantId` claim —
  endpoints trust the `:restaurantId` path param, matching the "not
  FK-enforced yet" scaffold status noted in the root CLAUDE.md.
