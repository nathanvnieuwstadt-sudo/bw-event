import { Hono } from "hono";
import { sql } from "../../db.js";
import { success } from "../../lib/response.js";
import { NotFoundError } from "../../lib/errors.js";
import { requireAuth, requireRole, getAuth } from "../../middleware/auth.js";
import type { AppEnv } from "../../middleware/auth.js";
import type { DraftStatus } from "../../types.js";
import { requiredParam } from "../../lib/params.js";

interface DraftRow {
  id: string;
  restaurant_id: string;
  email_thread_id: string;
  email_subject: string | null;
  email_sender_message: string | null;
  email_last_message_at: string | null;
  banquet_id: string | null;
  contact_name: string | null;
  draft_body: string;
  status: DraftStatus;
  created_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
}

const DRAFT_COLUMNS = `
  d.id, d.restaurant_id, d.email_thread_id, et.subject AS email_subject,
  et.last_message_body AS email_sender_message, et.last_message_at AS email_last_message_at,
  d.banquet_id, ct.name AS contact_name, d.draft_body, d.status,
  d.created_at, d.reviewed_by, d.reviewed_at
`;

function toResponse(d: DraftRow) {
  return {
    id: d.id,
    restaurantId: d.restaurant_id,
    emailThreadId: d.email_thread_id,
    emailSubject: d.email_subject,
    emailSenderMessage: d.email_sender_message,
    emailLastMessageAt: d.email_last_message_at,
    banquetId: d.banquet_id,
    contactName: d.contact_name,
    draftBody: d.draft_body,
    status: d.status,
    createdAt: d.created_at,
    reviewedBy: d.reviewed_by,
    reviewedAt: d.reviewed_at,
  };
}

async function findOrThrow(id: string): Promise<DraftRow> {
  const rows = await sql<DraftRow[]>`
    SELECT ${sql.unsafe(DRAFT_COLUMNS)}
    FROM agent_drafts d
    JOIN email_threads et ON et.id = d.email_thread_id
    LEFT JOIN banquets b ON b.id = d.banquet_id
    LEFT JOIN contacts ct ON ct.id = b.contact_id
    WHERE d.id = ${id}`;
  const draft = rows[0];
  if (!draft) throw new NotFoundError(`AgentDraft not found: ${id}`);
  return draft;
}

export const agentDraftsRoutes = new Hono<AppEnv>();

agentDraftsRoutes.use("*", requireAuth);

agentDraftsRoutes.get(
  "/",
  requireRole("DEV", "GENERAL_MANAGER", "FLOOR_MANAGER"),
  async (c) => {
    const restaurantId = requiredParam(c, "restaurantId");
    const rows = await sql<DraftRow[]>`
      SELECT ${sql.unsafe(DRAFT_COLUMNS)}
      FROM agent_drafts d
      JOIN email_threads et ON et.id = d.email_thread_id
      LEFT JOIN banquets b ON b.id = d.banquet_id
      LEFT JOIN contacts ct ON ct.id = b.contact_id
      WHERE d.restaurant_id = ${restaurantId}
      ORDER BY d.created_at DESC`;
    return c.json(success(rows.map(toResponse)));
  },
);

agentDraftsRoutes.get(
  "/pending",
  requireRole("DEV", "GENERAL_MANAGER", "FLOOR_MANAGER"),
  async (c) => {
    const restaurantId = requiredParam(c, "restaurantId");
    const rows = await sql<DraftRow[]>`
      SELECT ${sql.unsafe(DRAFT_COLUMNS)}
      FROM agent_drafts d
      JOIN email_threads et ON et.id = d.email_thread_id
      LEFT JOIN banquets b ON b.id = d.banquet_id
      LEFT JOIN contacts ct ON ct.id = b.contact_id
      WHERE d.restaurant_id = ${restaurantId} AND d.status = 'PENDING'
      ORDER BY d.created_at DESC`;
    return c.json(success(rows.map(toResponse)));
  },
);

async function review(id: string, reviewerId: string, status: "APPROVED" | "REJECTED") {
  await findOrThrow(id);
  await sql`
    UPDATE agent_drafts SET status = ${status}, reviewed_by = ${reviewerId}, reviewed_at = NOW()
    WHERE id = ${id}`;
  return toResponse(await findOrThrow(id));
}

agentDraftsRoutes.post(
  "/:id/approve",
  requireRole("DEV", "GENERAL_MANAGER", "FLOOR_MANAGER"),
  async (c) => {
    const auth = getAuth(c);
    return c.json(success(await review(requiredParam(c, "id"), auth.userId, "APPROVED")));
  },
);

agentDraftsRoutes.post(
  "/:id/reject",
  requireRole("DEV", "GENERAL_MANAGER", "FLOOR_MANAGER"),
  async (c) => {
    const auth = getAuth(c);
    return c.json(success(await review(requiredParam(c, "id"), auth.userId, "REJECTED")));
  },
);
