# Banquet Management Platform — Project Context

## Overview

Single-restaurant banquet management platform. Scaffolded as a multi-tenant foundation so adding a `restaurantId` enforcement layer and tenant isolation later requires minimal structural change.

## Stack

| Layer | Technology |
|---|---|
| Backend | Java 21, Spring Boot 3.x |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Database | PostgreSQL 16 (Docker locally, Cloud SQL on GCP) |
| Auth | JWT (HS256), role-based via Spring Security |
| Infra | GCP: Cloud Run, Cloud SQL, Artifact Registry, Secret Manager (europe-west1) |
| Email | Gmail API (scaffold only — not implemented) |
| AI Agent | Claude API (scaffold only — not implemented) |

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
├── backend/         Spring Boot application
├── frontend/        React + Vite SPA
├── infra/           GCP Cloud Run / Cloud Build configs
└── docker-compose.yml
```

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
| GENERAL_MANAGER | full | — | ✓ | ✓ | — |
| FLOOR_MANAGER | create/edit | — | — | approve drafts | — |
| KITCHEN | — | read+print | — | — | — |

## Agent Architecture (scaffold — not implemented)

`AgentMode` per restaurant: `APPROVAL` (floor manager approves every draft) or `AUTONOMOUS` (auto-send).

Placeholder service classes in `agent/service/`:
- `GmailPollingService` — poll inbox for new threads
- `EmailParsingService` — extract banquet details from email body
- `ClaudeApiService` — call Claude API to generate reply draft
- `DraftCreationService` — persist AgentDraft, notify floor manager

Flow: Gmail poll → parse → Claude → AgentDraft(PENDING) → [APPROVAL mode: floor manager reviews] → send

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
