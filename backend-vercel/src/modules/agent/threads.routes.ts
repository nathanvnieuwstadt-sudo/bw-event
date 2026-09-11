import { Hono } from "hono";
import { z } from "zod";
import { sql } from "../../db.js";
import { success } from "../../lib/response.js";
import { BadRequestError } from "../../lib/errors.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import type { AppEnv } from "../../middleware/auth.js";
import { requiredParam } from "../../lib/params.js";
import { generateDraft } from "./mockDraftGenerator.js";
import { generateReplyDraft } from "./claudeApiService.js";

const threadSchema = z
  .object({
    subject: z.string().min(1, "Subject is required"),
    messageBody: z.string().min(1, "Message body is required"),
    contactId: z.string().uuid().optional(),
    senderName: z.string().min(1).optional(),
    senderEmail: z.string().email().optional(),
  })
  .refine((v) => v.contactId || v.senderName, {
    message: "Either contactId or senderName is required",
  });

function parseBody(body: unknown) {
  const parsed = threadSchema.safeParse(body);
  if (!parsed.success) {
    throw new BadRequestError(parsed.error.issues.map((i) => i.message).join("; "));
  }
  return parsed.data;
}

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
  status: string;
  created_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
}

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

export const agentThreadsRoutes = new Hono<AppEnv>();

agentThreadsRoutes.use("*", requireAuth);

// Simulates an inbound email (no live Gmail integration yet — see CLAUDE.md).
// Creates the thread and immediately runs the mock draft generator so the
// agent inbox has something to review, exercising the same approve/reject
// pipeline a real Gmail-sourced thread would use.
agentThreadsRoutes.post(
  "/",
  requireRole("DEV", "GENERAL_MANAGER", "FLOOR_MANAGER"),
  async (c) => {
    const restaurantId = requiredParam(c, "restaurantId");
    const body = parseBody(await c.req.json().catch(() => ({})));

    let contactName: string | null = body.senderName ?? null;
    if (body.contactId) {
      const rows = await sql<{ name: string }[]>`
        SELECT name FROM contacts WHERE id = ${body.contactId} AND restaurant_id = ${restaurantId}`;
      if (!rows[0]) throw new BadRequestError(`Contact not found: ${body.contactId}`);
      contactName = rows[0].name;
    }

    const instructions = await sql<{ title: string; instruction: string; enabled: boolean }[]>`
      SELECT title, instruction, enabled FROM agent_instructions
      WHERE restaurant_id = ${restaurantId} AND enabled = TRUE`;

    const eventTypeRows = await sql<{ name: string; field_label: string | null }[]>`
      SELECT et.name, etf.field_label
      FROM event_types et
      LEFT JOIN event_type_fields etf ON etf.event_type_id = et.id
      WHERE et.restaurant_id = ${restaurantId}
      ORDER BY et.name, etf.display_order`;
    const eventTypes = Object.values(
      eventTypeRows.reduce<Record<string, { name: string; fieldLabels: string[] }>>((acc, row) => {
        acc[row.name] ??= { name: row.name, fieldLabels: [] };
        if (row.field_label) acc[row.name].fieldLabels.push(row.field_label);
        return acc;
      }, {}),
    );

    const threadRows = await sql<{ id: string }[]>`
      INSERT INTO email_threads
        (restaurant_id, contact_id, sender_name, sender_email, subject, last_message_at, last_message_body)
      VALUES (
        ${restaurantId}, ${body.contactId ?? null}, ${body.senderName ?? null}, ${body.senderEmail ?? null},
        ${body.subject}, NOW(), ${body.messageBody}
      )
      RETURNING id`;
    const threadId = threadRows[0].id;

    const draftBody =
      (await generateReplyDraft({
        contactName,
        subject: body.subject,
        messageBody: body.messageBody,
        eventTypes,
        instructions,
      })) ??
      generateDraft({
        contactName,
        subject: body.subject,
        messageBody: body.messageBody,
        instructions,
      });

    const draftRows = await sql<DraftRow[]>`
      WITH inserted AS (
        INSERT INTO agent_drafts (restaurant_id, email_thread_id, draft_body, status)
        VALUES (${restaurantId}, ${threadId}, ${draftBody}, 'PENDING')
        RETURNING *
      )
      SELECT
        inserted.id, inserted.restaurant_id, inserted.email_thread_id,
        ${body.subject}::text AS email_subject,
        ${body.messageBody}::text AS email_sender_message,
        inserted.created_at AS email_last_message_at,
        inserted.banquet_id,
        ${contactName}::text AS contact_name,
        inserted.draft_body, inserted.status,
        inserted.created_at, inserted.reviewed_by, inserted.reviewed_at
      FROM inserted`;

    return c.json(success(toResponse(draftRows[0])), 201);
  },
);
