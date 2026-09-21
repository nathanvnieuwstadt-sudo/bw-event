# Banquet Management Platform — Project Context

## Overview

Single-restaurant banquet management platform, scaffolded as a multi-tenant foundation. Plan: develop against Vercel + Supabase (`backend-vercel`) for fast iteration, then run the real, launched product on the Java/Spring Boot backend on GCP (Cloud Run + Cloud SQL) — see "Which backend is live" below. The Java backend now enforces restaurantId against the caller's JWT on every `/restaurants/{restaurantId}/**` endpoint (see `config/TenantGuard.java`) rather than trusting the URL path.

## Stack

| Layer | Technology |
|---|---|
| Backend | Java 21, Spring Boot 3.x |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Database | PostgreSQL 16 (Docker locally, Cloud SQL on GCP) |
| Auth | JWT (HS256), role-based via Spring Security |
| Infra | GCP: Cloud Run, Cloud SQL, Artifact Registry, Secret Manager (europe-west1) |
| Email | Gmail API (scaffold only — not implemented) |
| AI Agent | Claude API — real draft generation implemented in `backend-vercel` (see below); Gmail send still not implemented |

## Local Development

```bash
docker-compose up --build
# Backend: http://localhost:8080
# Frontend: http://localhost:3000
# Postgres: localhost:5432 / bwevent / bwevent / bwevent_local
```

Dev seed user (created by V2 migration):
- Email: `dev@bwevent.local`
- Password: `devpassword`
- Role: `DEV`

## Project Structure

```
bw-event/
├── backend/         Spring Boot application (GCP Cloud Run target)
├── backend-vercel/  Node/TypeScript backend (Vercel + Supabase target — see below)
├── frontend/        React + Vite SPA
├── infra/           GCP Cloud Run / Cloud Build configs
└── docker-compose.yml
```

**Two interchangeable backends target two different infra paths.** `backend/`
(Java/Spring Boot) deploys to GCP per the section below. `backend-vercel/`
(Hono + postgres.js, no ORM) is a from-scratch reimplementation of the exact
same API contract — same routes, same `{data,message,timestamp}` envelope,
same JWT claims, same bcrypt hashes — built to run as Vercel serverless
functions against a Supabase Postgres database instead of Cloud Run/Cloud
SQL. The frontend works against either unmodified; only `VITE_API_BASE_URL`
changes. See `backend-vercel/README.md` for deploy steps and the one
deliberate behavior deviation (401 instead of Spring Security's bare 403 on
a missing/invalid token).

**Which backend is live.** `backend-vercel` + Supabase is what's actually deployed
and in front of the client today (Vercel projects `bw-event` / `bw-event-frontend`).
`backend/` (Java) has never been deployed anywhere — it exists to reach feature
parity during development and become the real production backend at launch (GCP
Cloud Run + Cloud SQL, europe-west1). Going forward, large new features (starting
with the real AI email agent — see Agent Architecture below) are being built
directly in `backend/` rather than ported over later, since building something
that size twice isn't worth it. Smaller features still land in `backend-vercel`
first per the established pattern.

### Backend: `backend/src/main/java/com/bwevent/`

```
BanquetApplication.java
config/          SecurityConfig, JwtConfig, CorsConfig
auth/            JWT provider, login controller + service, DTOs
domain/
  enums/         UserRole, BanquetStatus, BanquetSource, AgentMode, DraftStatus
  model/         All JPA entities (see Entity Model below)
restaurant/      Restaurant CRUD (controller → service → repository)
user/            User management
banquet/         Banquet CRUD — core feature
contact/         Contact management
menuitem/        MenuItem (child of Banquet)
agent/           Email agent scaffold (placeholder services + repositories)
```

### Frontend: `frontend/src/`

```
types/           TypeScript interfaces matching backend DTOs
api/             Axios client + per-domain API functions
auth/            AuthContext, useAuth hook, ProtectedRoute
pages/
  LoginPage
  DashboardPage          role-aware redirect hub
  banquet/               List, Detail, Form (create+edit)
  kitchen/               KitchenViewPage (read-only + print)
  owner/                 OwnerOverviewPage (read-only)
  agent/                 AgentDraftPage (scaffold)
components/
  layout/        AppShell, Sidebar, TopBar
  banquet/       BanquetTable, BanquetStatusBadge, BanquetForm, MenuItemEditor
  ui/            Button, Badge, Modal, Table (reusable primitives)
```

## Entity Model

### Restaurant
- id (UUID PK), name, agentMode (APPROVAL|AUTONOMOUS), createdAt
- **Multi-tenancy stub:** every other entity carries `restaurantId UUID` — not FK-enforced yet, will be once multi-tenant auth is wired

### User
- id, restaurantId (nullable for DEV), email, passwordHash, role, createdAt

### Contact
- id, restaurantId, name, email, phone?, organization?, createdAt, updatedAt

### Banquet ← central entity
- id, restaurantId, contactId→Contact, status (DRAFT|CONFIRMED|CANCELLED), source (MANUAL|EMAIL)
- date, startTime, endTime, headcount, budget?, roomSetup?, dietaryRestrictions?, avNeeds?
- depositPaid (bool), depositAmount?, notes?, createdBy→User, createdAt, updatedAt
- **Validation rule:** CONFIRMED requires date, startTime, endTime, headcount, contactId all non-null

### MenuItem
- id, restaurantId, banquetId→Banquet (cascade delete), dishName, quantity, notes?

### EmailThread (scaffold)
- id, restaurantId, banquetId→Banquet (nullable), gmailThreadId (placeholder), subject, lastMessageAt, createdAt

### AgentDraft (scaffold)
- id, restaurantId, emailThreadId→EmailThread, banquetId→Banquet (nullable)
- draftBody (TEXT), status (PENDING|APPROVED|REJECTED|SENT)
- createdAt, reviewedBy→User (nullable), reviewedAt (nullable)

## Role Access

| Role | Banquet CRUD | Kitchen View | Reports | Agent | User Mgmt |
|---|---|---|---|---|---|
| DEV | full | ✓ | ✓ | ✓ | ✓ |
| OWNER | read-only | — | ✓ | read | — |
| GENERAL_MANAGER | full | — | ✓ | ✓ | ✓ |
| FLOOR_MANAGER | create/edit | — | — | approve drafts | — |
| KITCHEN | — | read+print | — | — | — |

User Mgmt (DEV/GENERAL_MANAGER) means create/list/remove staff accounts for their
own restaurant — `POST/GET /restaurants/{id}/users`, `DELETE /restaurants/{id}/users/{userId}`
in both backends, and the "Personnel" page in the frontend. DEV is deliberately not an
assignable role through this endpoint — it's reserved for whoever maintains the app, not
restaurant staff. There is no self-service password reset yet; a new account's password is
set once at creation time and communicated to the staff member directly.

## Agent Architecture

`AgentMode` per restaurant: `APPROVAL` (floor manager approves every draft) or `AUTONOMOUS` (auto-send — not
implemented; every draft currently requires review).

**Two generations of this feature exist, in two different backends — don't confuse them.**

### backend-vercel (deployed, simulated intake, mock/Claude draft only)

There is no Gmail inbox — inbound email is simulated. The "Simuler un e-mail" action on the agent inbox
page (staff pick a contact or type a sender, subject, and message) stands in for real Gmail polling,
creating an `EmailThread` and immediately generating an `AgentDraft`.

Draft generation, in `backend-vercel/src/modules/agent/`:
- `claudeApiService.ts` — real call to the Claude API (`claude-opus-5`), given the email thread, the
  restaurant's event types + required fields, and its enabled agent instructions as context. Requires
  `CLAUDE_API_KEY`; returns `null` on any failure (missing key, auth error, rate limit, refusal) rather
  than throwing.
- `mockDraftGenerator.ts` — template/heuristic fallback used whenever `claudeApiService` returns `null`.

Approving a draft only marks it `APPROVED` — no send path. This generation of the feature is frozen; new
work goes to the Java backend below.

### backend/ (Java — the real build, in progress, not yet deployed)

Full spec: rules-aware, human-gated AI agent with real Gmail ingestion (classification with a
default-to-`uncertain` fallback, never silently dropped), a knowledge base the model may draw facts
from, an approval-gated real Gmail send, and a scheduled correction-analysis loop that proposes rule/KB
changes for staff to accept or dismiss — never auto-applied.

Built so far (foundation slice):
- Tenant isolation is now real: `config/AuthPrincipal.java` carries the JWT's restaurantId through Spring
  Security, and `config/TenantGuard.java` backs `@tenantGuard.check(#restaurantId)`, added to every
  `@PreAuthorize` on a `/restaurants/{restaurantId}/**` endpoint. A caller whose JWT restaurantId doesn't
  match the path gets a 403 (DEV is exempt — it's the cross-restaurant vendor role).
- `agent_instructions` **is** the rules table (`drafting_rules` from the spec) — extended with
  `created_by` and `checkable_type` (`domain/enums/CheckableRuleType.java`) rather than duplicated.
  `checkable_type` is null for the vast majority of rules, which are prompt-only by nature (not every
  plain-language rule reduces to something a program can verify) — only flip it for a rule the
  post-generation validator can actually check against knowledge-base data (unlisted-price, blackout-date
  confirmation), once that validator exists.
- New `com.bwevent.knowledgebase` module (entity/DTO/repository/service/controller) —
  `/restaurants/{restaurantId}/agent/knowledge-base` CRUD for menu/pricing/policy/deposit/capacity/
  blackout-date facts, with an optional `structuredValue` JSON field for whatever a rule check needs to
  compare against (a number, a date) alongside the human-readable `content`.
- Migration `V10__ai_agent_gmail_rules_and_knowledge_base.sql` also creates `gmail_connections`,
  `pipeline_health_events`, `processed_emails` (the ingestion ledger — every email seen, regardless of
  classification, for a "did we see everything" audit), `agent_suggestions`, and `agent_analysis_runs`,
  and extends `agent_drafts` with the generation/review audit trail (`generation_prompt`,
  `model_raw_output`, `rules_snapshot`, `knowledge_base_snapshot`, `rule_violations`, `final_body`,
  `edit_diff`). These tables/columns exist ahead of the code that uses them — the ingestion poller, the
  send gate, and the analysis job are later slices, not yet built.
- Honest limitation, stated here so it isn't oversold later: classification confidence is a self-reported
  number from the model, not a calibrated probability — the threshold is deliberately conservative (biased
  toward `uncertain` over a false-confident miss) but can't guarantee it matches what a human would call
  ambiguous. Likewise, only a small, explicitly-typed subset of rules (`CheckableRuleType`) is ever
  mechanically verified; everything else is "the model was asked to," not "guaranteed."

Not yet built: Gmail OAuth connect/poll, the classifier, the draft-generation audit trail actually being
populated, the approval-gated real send, and the correction-analysis job. `ClaudeApiService` in this
backend is still the original placeholder.

Flow (target): Gmail poll → classify → (event_request/event_followup/uncertain) EmailThread → Claude
draft, constrained by knowledge base + active rules → AgentDraft(PENDING) → floor manager reviews/edits →
approve triggers the real Gmail send; reject stores nothing further. Corrections (draft vs. approved
final) feed a scheduled analysis job that proposes rule/KB changes — staff approve, edit, or dismiss each
one; nothing is applied automatically.

## GCP / Cloud SQL Migration Path

- `application.yml` reads DB config from env vars (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`)
- Locally those are set in `docker-compose.yml`
- On Cloud Run they will be injected from Secret Manager via Cloud Run env var references
- No code change needed — only infra config changes (`infra/cloud-run-backend.yaml`)
- Cloud SQL uses Unix socket: set `DB_HOST=/cloudsql/PROJECT:REGION:INSTANCE` and add Cloud SQL connector dependency when migrating

## API Conventions

- Base path: `/api/v1/`
- Auth header: `Authorization: Bearer <jwt>`
- All responses wrapped: `{ data, message, timestamp }`
- Errors: `{ error, message, timestamp, status }`
- Validation errors: 400 with field-level messages

## Database Migrations

Flyway, auto-run on startup. Migration files in `src/main/resources/db/migration/`.
- `V1__init_schema.sql` — full schema
- `V2__seed_dev_user.sql` — dev user (password: `devpassword`, bcrypt hashed)
