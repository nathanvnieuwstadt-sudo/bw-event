import { Hono } from "hono";
import { z } from "zod";
import { sql } from "../../db.js";
import { success } from "../../lib/response.js";
import { NotFoundError, BadRequestError } from "../../lib/errors.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import type { AppEnv } from "../../middleware/auth.js";
import type { FieldType } from "../../types.js";
import { requiredParam } from "../../lib/params.js";

const fieldSchema = z.object({
  fieldLabel: z.string().min(1, "Field label is required"),
  fieldType: z.enum(["TEXT", "NUMBER", "BOOLEAN", "SELECT"]).nullable().optional(),
  options: z.string().nullable().optional(),
  required: z.boolean().nullable().optional(),
  displayOrder: z.number().int().nullable().optional(),
});

const eventTypeSchema = z.object({
  name: z.string().min(1, "Event type name is required"),
  description: z.string().nullable().optional(),
  fields: z.array(fieldSchema).optional(),
});

/** Converts a human label to a snake_case key, e.g. "Dress Code" -> "dress_code" */
function toKey(label: string): string {
  const normalized = label.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return normalized
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

interface EventTypeRow {
  id: string;
  restaurant_id: string;
  name: string;
  description: string | null;
  created_at: string;
}

interface FieldRow {
  id: string;
  event_type_id: string;
  field_key: string;
  field_label: string;
  field_type: FieldType;
  options: string | null;
  required: boolean;
  display_order: number;
}

function fieldToResponse(f: FieldRow) {
  const options = f.options
    ? f.options.split(",").map((s) => s.trim()).filter((s) => s.length > 0)
    : [];
  return {
    id: f.id,
    fieldKey: f.field_key,
    fieldLabel: f.field_label,
    fieldType: f.field_type,
    options,
    required: f.required,
    displayOrder: f.display_order,
  };
}

async function toResponse(e: EventTypeRow) {
  const fields = await sql<FieldRow[]>`
    SELECT * FROM event_type_fields WHERE event_type_id = ${e.id} ORDER BY display_order ASC`;
  return {
    id: e.id,
    restaurantId: e.restaurant_id,
    name: e.name,
    description: e.description,
    fields: fields.map(fieldToResponse),
    createdAt: e.created_at,
  };
}

async function findOrThrow(id: string): Promise<EventTypeRow> {
  const rows = await sql<EventTypeRow[]>`SELECT * FROM event_types WHERE id = ${id}`;
  const row = rows[0];
  if (!row) throw new NotFoundError(`EventType not found: ${id}`);
  return row;
}

function parseBody(body: unknown) {
  const parsed = eventTypeSchema.safeParse(body);
  if (!parsed.success) {
    throw new BadRequestError(parsed.error.issues.map((i) => i.message).join("; "));
  }
  return parsed.data;
}

export const eventTypesRoutes = new Hono<AppEnv>();

eventTypesRoutes.use("*", requireAuth);

eventTypesRoutes.get(
  "/",
  requireRole("DEV", "OWNER", "GENERAL_MANAGER", "FLOOR_MANAGER"),
  async (c) => {
    const restaurantId = requiredParam(c, "restaurantId");
    const rows = await sql<EventTypeRow[]>`
      SELECT * FROM event_types WHERE restaurant_id = ${restaurantId} ORDER BY name ASC`;
    return c.json(success(await Promise.all(rows.map(toResponse))));
  },
);

eventTypesRoutes.get(
  "/:id",
  requireRole("DEV", "OWNER", "GENERAL_MANAGER", "FLOOR_MANAGER"),
  async (c) => {
    return c.json(success(await toResponse(await findOrThrow(requiredParam(c, "id")))));
  },
);

eventTypesRoutes.post("/", requireRole("DEV", "GENERAL_MANAGER"), async (c) => {
  const restaurantId = requiredParam(c, "restaurantId");
  const body = parseBody(await c.req.json().catch(() => ({})));

  const created = await sql.begin(async (tx) => {
    const rows = await tx<EventTypeRow[]>`
      INSERT INTO event_types (restaurant_id, name, description)
      VALUES (${restaurantId}, ${body.name}, ${body.description ?? null})
      RETURNING *`;
    const eventType = rows[0];
    if (body.fields?.length) {
      for (let i = 0; i < body.fields.length; i++) {
        const f = body.fields[i];
        await tx`
          INSERT INTO event_type_fields (event_type_id, field_key, field_label, field_type, options, required, display_order)
          VALUES (
            ${eventType.id}, ${toKey(f.fieldLabel)}, ${f.fieldLabel}, ${f.fieldType ?? "TEXT"},
            ${f.options ?? null}, ${f.required ?? false}, ${f.displayOrder ?? i}
          )`;
      }
    }
    return eventType;
  });

  return c.json(success(await toResponse(created)), 201);
});

eventTypesRoutes.put("/:id", requireRole("DEV", "GENERAL_MANAGER"), async (c) => {
  const id = requiredParam(c, "id");
  await findOrThrow(id);
  const body = parseBody(await c.req.json().catch(() => ({})));

  const updated = await sql.begin(async (tx) => {
    const rows = await tx<EventTypeRow[]>`
      UPDATE event_types SET name = ${body.name}, description = ${body.description ?? null}
      WHERE id = ${id}
      RETURNING *`;
    await tx`DELETE FROM event_type_fields WHERE event_type_id = ${id}`;
    if (body.fields?.length) {
      for (let i = 0; i < body.fields.length; i++) {
        const f = body.fields[i];
        await tx`
          INSERT INTO event_type_fields (event_type_id, field_key, field_label, field_type, options, required, display_order)
          VALUES (
            ${id}, ${toKey(f.fieldLabel)}, ${f.fieldLabel}, ${f.fieldType ?? "TEXT"},
            ${f.options ?? null}, ${f.required ?? false}, ${f.displayOrder ?? i}
          )`;
      }
    }
    return rows[0];
  });

  return c.json(success(await toResponse(updated)));
});

eventTypesRoutes.delete("/:id", requireRole("DEV", "GENERAL_MANAGER"), async (c) => {
  const id = requiredParam(c, "id");
  await findOrThrow(id);
  await sql`DELETE FROM event_types WHERE id = ${id}`;
  return c.body(null, 204);
});
