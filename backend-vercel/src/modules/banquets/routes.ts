import { Hono } from "hono";
import { z } from "zod";
import type { TransactionSql } from "postgres";
import { sql } from "../../db.js";
import { success } from "../../lib/response.js";
import { NotFoundError, BadRequestError } from "../../lib/errors.js";
import { requireAuth, requireRole, getAuth } from "../../middleware/auth.js";
import type { AppEnv } from "../../middleware/auth.js";
import type { BanquetSource, BanquetStatus, FieldType } from "../../types.js";
import { requiredParam } from "../../lib/params.js";

const menuItemSchema = z.object({
  dishName: z.string().min(1, "Dish name is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  notes: z.string().nullable().optional(),
});

const banquetSchema = z.object({
  contactId: z.string().uuid().nullable().optional(),
  status: z.enum(["DRAFT", "CONFIRMED", "CANCELLED"]).nullable().optional(),
  source: z.enum(["MANUAL", "EMAIL"]).nullable().optional(),
  date: z.string().nullable().optional(), // YYYY-MM-DD
  startTime: z.string().nullable().optional(), // HH:mm[:ss]
  endTime: z.string().nullable().optional(),
  headcount: z.number().int().min(1, "Headcount must be at least 1").nullable().optional(),
  budget: z.number().nullable().optional(),
  roomSetup: z.string().nullable().optional(),
  dietaryRestrictions: z.string().nullable().optional(),
  avNeeds: z.string().nullable().optional(),
  depositPaid: z.boolean().nullable().optional(),
  depositAmount: z.number().nullable().optional(),
  notes: z.string().nullable().optional(),
  eventTypeId: z.string().uuid().nullable().optional(),
  fieldValues: z.record(z.string(), z.string().nullable()).optional(),
  menuItems: z.array(menuItemSchema).optional(),
});
type BanquetBody = z.infer<typeof banquetSchema>;

function parseBody(body: unknown): BanquetBody {
  const parsed = banquetSchema.safeParse(body);
  if (!parsed.success) {
    throw new BadRequestError(parsed.error.issues.map((i) => i.message).join("; "));
  }
  return parsed.data;
}

function num(value: string | null): number | null {
  return value === null || value === undefined ? null : Number(value);
}

interface ContactRow {
  id: string;
  restaurant_id: string;
  name: string;
  email: string;
  phone: string | null;
  organization: string | null;
  created_at: string;
  updated_at: string;
}

function contactToResponse(c: ContactRow) {
  return {
    id: c.id,
    restaurantId: c.restaurant_id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    organization: c.organization,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
  };
}

async function findContactOrThrow(id: string): Promise<ContactRow> {
  const rows = await sql<ContactRow[]>`SELECT * FROM contacts WHERE id = ${id}`;
  const contact = rows[0];
  if (!contact) throw new NotFoundError(`Contact not found: ${id}`);
  return contact;
}

interface EventTypeFieldRow {
  id: string;
  field_key: string;
  field_label: string;
  field_type: FieldType;
  options: string | null;
  required: boolean;
  display_order: number;
}

async function loadEventType(id: string) {
  const rows = await sql<
    { id: string; restaurant_id: string; name: string; description: string | null; created_at: string }[]
  >`SELECT * FROM event_types WHERE id = ${id}`;
  const eventType = rows[0];
  if (!eventType) return null;
  const fields = await sql<EventTypeFieldRow[]>`
    SELECT * FROM event_type_fields WHERE event_type_id = ${id} ORDER BY display_order ASC`;
  return {
    id: eventType.id,
    restaurantId: eventType.restaurant_id,
    name: eventType.name,
    description: eventType.description,
    fields: fields.map((f) => ({
      id: f.id,
      fieldKey: f.field_key,
      fieldLabel: f.field_label,
      fieldType: f.field_type,
      options: f.options ? f.options.split(",").map((s) => s.trim()).filter(Boolean) : [],
      required: f.required,
      displayOrder: f.display_order,
    })),
    createdAt: eventType.created_at,
  };
}

interface BanquetRow {
  id: string;
  restaurant_id: string;
  contact_id: string | null;
  status: BanquetStatus;
  source: BanquetSource;
  date: string | null;
  start_time: string | null;
  end_time: string | null;
  headcount: number | null;
  budget: string | null;
  room_setup: string | null;
  dietary_restrictions: string | null;
  av_needs: string | null;
  deposit_paid: boolean;
  deposit_amount: string | null;
  notes: string | null;
  event_type_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

async function findBanquetOrThrow(id: string): Promise<BanquetRow> {
  const rows = await sql<BanquetRow[]>`
    SELECT id, restaurant_id, contact_id, status, source,
           to_char(event_date, 'YYYY-MM-DD') AS date,
           to_char(start_time, 'HH24:MI:SS') AS start_time,
           to_char(end_time, 'HH24:MI:SS') AS end_time,
           headcount, budget::text AS budget, room_setup, dietary_restrictions, av_needs,
           deposit_paid, deposit_amount::text AS deposit_amount, notes, event_type_id, created_by,
           created_at, updated_at
    FROM banquets
    WHERE id = ${id}`;
  const banquet = rows[0];
  if (!banquet) throw new NotFoundError(`Banquet not found: ${id}`);
  return banquet;
}

interface MenuItemRow {
  id: string;
  dish_name: string;
  quantity: number;
  notes: string | null;
}

async function buildResponse(b: BanquetRow) {
  const [contactRows, menuItemRows, fieldValueRows, eventType] = await Promise.all([
    b.contact_id
      ? sql<ContactRow[]>`SELECT * FROM contacts WHERE id = ${b.contact_id}`
      : Promise.resolve([] as ContactRow[]),
    sql<MenuItemRow[]>`SELECT id, dish_name, quantity, notes FROM menu_items WHERE banquet_id = ${b.id}`,
    sql<{ field_id: string; value: string | null }[]>`
      SELECT field_id, value FROM banquet_field_values WHERE banquet_id = ${b.id}`,
    b.event_type_id ? loadEventType(b.event_type_id) : Promise.resolve(null),
  ]);

  const fieldValues: Record<string, string> = {};
  for (const fv of fieldValueRows) fieldValues[fv.field_id] = fv.value ?? "";

  return {
    id: b.id,
    restaurantId: b.restaurant_id,
    contact: contactRows[0] ? contactToResponse(contactRows[0]) : null,
    status: b.status,
    source: b.source,
    date: b.date,
    startTime: b.start_time,
    endTime: b.end_time,
    headcount: b.headcount,
    budget: num(b.budget),
    roomSetup: b.room_setup,
    dietaryRestrictions: b.dietary_restrictions,
    avNeeds: b.av_needs,
    depositPaid: b.deposit_paid,
    depositAmount: num(b.deposit_amount),
    notes: b.notes,
    createdBy: b.created_by,
    menuItems: menuItemRows.map((m) => ({
      id: m.id,
      dishName: m.dish_name,
      quantity: m.quantity,
      notes: m.notes,
    })),
    eventType,
    fieldValues,
    createdAt: b.created_at,
    updatedAt: b.updated_at,
  };
}

function assertConfirmable(
  status: BanquetStatus,
  date: string | null | undefined,
  startTime: string | null | undefined,
  endTime: string | null | undefined,
  headcount: number | null | undefined,
  contactId: string | null | undefined,
) {
  if (status !== "CONFIRMED") return;
  if (!date || !startTime || !endTime || !headcount || !contactId) {
    throw new BadRequestError(
      "Cannot confirm banquet: date, start time, end time, headcount, and contact are required",
    );
  }
}

async function insertMenuItems(
  tx: TransactionSql,
  banquetId: string,
  restaurantId: string,
  items: z.infer<typeof menuItemSchema>[] | undefined,
) {
  if (!items?.length) return;
  for (const item of items) {
    await tx`
      INSERT INTO menu_items (restaurant_id, banquet_id, dish_name, quantity, notes)
      VALUES (${restaurantId}, ${banquetId}, ${item.dishName}, ${item.quantity}, ${item.notes ?? null})`;
  }
}

async function insertFieldValues(
  tx: TransactionSql,
  banquetId: string,
  fieldValues: Record<string, string | null> | undefined,
) {
  if (!fieldValues) return;
  for (const [fieldId, value] of Object.entries(fieldValues)) {
    if (value === null || value === undefined || value.trim() === "") continue;
    await tx`
      INSERT INTO banquet_field_values (banquet_id, field_id, value)
      VALUES (${banquetId}, ${fieldId}, ${value})`;
  }
}

export const banquetsRoutes = new Hono<AppEnv>();

banquetsRoutes.use("*", requireAuth);

banquetsRoutes.get(
  "/",
  requireRole("DEV", "OWNER", "GENERAL_MANAGER", "FLOOR_MANAGER"),
  async (c) => {
    const restaurantId = requiredParam(c, "restaurantId");
    const rows = await sql<
      (BanquetRow & { contact_name: string | null; contact_organization: string | null })[]
    >`
      SELECT b.id, b.status, b.source,
             to_char(b.event_date, 'YYYY-MM-DD') AS date,
             to_char(b.start_time, 'HH24:MI:SS') AS start_time,
             to_char(b.end_time, 'HH24:MI:SS') AS end_time,
             b.headcount, ct.name AS contact_name, ct.organization AS contact_organization
      FROM banquets b LEFT JOIN contacts ct ON ct.id = b.contact_id
      WHERE b.restaurant_id = ${restaurantId}
      ORDER BY b.event_date ASC, b.start_time ASC`;
    return c.json(
      success(
        rows.map((b) => ({
          id: b.id,
          status: b.status,
          source: b.source,
          date: b.date,
          startTime: b.start_time,
          endTime: b.end_time,
          headcount: b.headcount,
          contactName: b.contact_name,
          contactOrganization: b.contact_organization,
        })),
      ),
    );
  },
);

banquetsRoutes.get(
  "/upcoming",
  requireRole("DEV", "OWNER", "GENERAL_MANAGER", "FLOOR_MANAGER", "KITCHEN"),
  async (c) => {
    const restaurantId = requiredParam(c, "restaurantId");
    const days = Number(c.req.query("days") ?? "30");
    const rows = await sql<
      (BanquetRow & { contact_name: string | null; contact_organization: string | null })[]
    >`
      SELECT b.id, b.status, b.source,
             to_char(b.event_date, 'YYYY-MM-DD') AS date,
             to_char(b.start_time, 'HH24:MI:SS') AS start_time,
             to_char(b.end_time, 'HH24:MI:SS') AS end_time,
             b.headcount, ct.name AS contact_name, ct.organization AS contact_organization
      FROM banquets b LEFT JOIN contacts ct ON ct.id = b.contact_id
      WHERE b.restaurant_id = ${restaurantId}
        AND b.event_date >= CURRENT_DATE
        AND b.event_date <= CURRENT_DATE + ${days}::int
      ORDER BY b.event_date ASC, b.start_time ASC`;
    return c.json(
      success(
        rows.map((b) => ({
          id: b.id,
          status: b.status,
          source: b.source,
          date: b.date,
          startTime: b.start_time,
          endTime: b.end_time,
          headcount: b.headcount,
          contactName: b.contact_name,
          contactOrganization: b.contact_organization,
        })),
      ),
    );
  },
);

banquetsRoutes.get(
  "/:id",
  requireRole("DEV", "OWNER", "GENERAL_MANAGER", "FLOOR_MANAGER", "KITCHEN"),
  async (c) => {
    const banquet = await findBanquetOrThrow(requiredParam(c, "id"));
    return c.json(success(await buildResponse(banquet)));
  },
);

banquetsRoutes.post(
  "/",
  requireRole("DEV", "GENERAL_MANAGER", "FLOOR_MANAGER"),
  async (c) => {
    const restaurantId = requiredParam(c, "restaurantId");
    const auth = getAuth(c);
    const body = parseBody(await c.req.json().catch(() => ({})));

    if (body.contactId) await findContactOrThrow(body.contactId);

    const status = body.status ?? "DRAFT";
    assertConfirmable(status, body.date, body.startTime, body.endTime, body.headcount, body.contactId);

    const created = await sql.begin(async (tx) => {
      const rows = await tx<{ id: string }[]>`
        INSERT INTO banquets (
          restaurant_id, contact_id, status, source, event_date, start_time, end_time,
          headcount, budget, room_setup, dietary_restrictions, av_needs,
          deposit_paid, deposit_amount, notes, event_type_id, created_by
        ) VALUES (
          ${restaurantId}, ${body.contactId ?? null}, ${status}, ${body.source ?? "MANUAL"},
          ${body.date ?? null}, ${body.startTime ?? null}, ${body.endTime ?? null},
          ${body.headcount ?? null}, ${body.budget ?? null}, ${body.roomSetup ?? null},
          ${body.dietaryRestrictions ?? null}, ${body.avNeeds ?? null},
          ${body.depositPaid ?? false}, ${body.depositAmount ?? null}, ${body.notes ?? null},
          ${body.eventTypeId ?? null}, ${auth.userId}
        ) RETURNING id`;
      const id = rows[0].id;
      await insertMenuItems(tx, id, restaurantId, body.menuItems);
      await insertFieldValues(tx, id, body.fieldValues);
      return id;
    });

    return c.json(success(await buildResponse(await findBanquetOrThrow(created))), 201);
  },
);

banquetsRoutes.put(
  "/:id",
  requireRole("DEV", "GENERAL_MANAGER", "FLOOR_MANAGER"),
  async (c) => {
    const id = requiredParam(c, "id");
    const restaurantId = requiredParam(c, "restaurantId");
    const existing = await findBanquetOrThrow(id);
    const body = parseBody(await c.req.json().catch(() => ({})));

    let contactId = existing.contact_id;
    if (body.contactId) {
      await findContactOrThrow(body.contactId);
      contactId = body.contactId;
    }
    const status = body.status ?? existing.status;
    const depositPaid = body.depositPaid ?? existing.deposit_paid;

    assertConfirmable(status, body.date, body.startTime, body.endTime, body.headcount, contactId);

    await sql.begin(async (tx) => {
      await tx`
        UPDATE banquets SET
          contact_id = ${contactId}, status = ${status},
          event_date = ${body.date ?? null}, start_time = ${body.startTime ?? null},
          end_time = ${body.endTime ?? null}, headcount = ${body.headcount ?? null},
          budget = ${body.budget ?? null}, room_setup = ${body.roomSetup ?? null},
          dietary_restrictions = ${body.dietaryRestrictions ?? null}, av_needs = ${body.avNeeds ?? null},
          deposit_paid = ${depositPaid}, deposit_amount = ${body.depositAmount ?? null},
          notes = ${body.notes ?? null}, event_type_id = ${body.eventTypeId ?? null},
          updated_at = NOW()
        WHERE id = ${id}`;
      await tx`DELETE FROM menu_items WHERE banquet_id = ${id}`;
      await insertMenuItems(tx, id, restaurantId, body.menuItems);
      await tx`DELETE FROM banquet_field_values WHERE banquet_id = ${id}`;
      await insertFieldValues(tx, id, body.fieldValues);
    });

    return c.json(success(await buildResponse(await findBanquetOrThrow(id))));
  },
);

banquetsRoutes.delete("/:id", requireRole("DEV", "GENERAL_MANAGER"), async (c) => {
  const id = requiredParam(c, "id");
  await findBanquetOrThrow(id);
  await sql`DELETE FROM banquets WHERE id = ${id}`;
  return c.body(null, 204);
});
