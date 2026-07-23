import { Hono } from "hono";
import { z } from "zod";
import { sql } from "../../db.js";
import { success } from "../../lib/response.js";
import { NotFoundError, BadRequestError } from "../../lib/errors.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import type { AppEnv } from "../../middleware/auth.js";
import { requiredParam } from "../../lib/params.js";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  phone: z.string().nullable().optional(),
  organization: z.string().nullable().optional(),
});

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

function toResponse(c: ContactRow) {
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

async function findOrThrow(id: string): Promise<ContactRow> {
  const rows = await sql<ContactRow[]>`SELECT * FROM contacts WHERE id = ${id}`;
  const contact = rows[0];
  if (!contact) throw new NotFoundError(`Contact not found: ${id}`);
  return contact;
}

function parseBody(body: unknown) {
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    throw new BadRequestError(parsed.error.issues.map((i) => i.message).join("; "));
  }
  return parsed.data;
}

export const contactsRoutes = new Hono<AppEnv>();

contactsRoutes.use("*", requireAuth);

contactsRoutes.get(
  "/",
  requireRole("DEV", "OWNER", "GENERAL_MANAGER", "FLOOR_MANAGER"),
  async (c) => {
    const restaurantId = requiredParam(c, "restaurantId");
    const rows = await sql<ContactRow[]>`
      SELECT * FROM contacts WHERE restaurant_id = ${restaurantId} ORDER BY name ASC`;
    return c.json(success(rows.map(toResponse)));
  },
);

contactsRoutes.get(
  "/:id",
  requireRole("DEV", "OWNER", "GENERAL_MANAGER", "FLOOR_MANAGER"),
  async (c) => {
    return c.json(success(toResponse(await findOrThrow(requiredParam(c, "id")))));
  },
);

contactsRoutes.post(
  "/",
  requireRole("DEV", "GENERAL_MANAGER", "FLOOR_MANAGER"),
  async (c) => {
    const restaurantId = requiredParam(c, "restaurantId");
    const body = parseBody(await c.req.json().catch(() => ({})));
    const rows = await sql<ContactRow[]>`
      INSERT INTO contacts (restaurant_id, name, email, phone, organization)
      VALUES (${restaurantId}, ${body.name}, ${body.email}, ${body.phone ?? null}, ${body.organization ?? null})
      RETURNING *`;
    return c.json(success(toResponse(rows[0])), 201);
  },
);

contactsRoutes.put(
  "/:id",
  requireRole("DEV", "GENERAL_MANAGER", "FLOOR_MANAGER"),
  async (c) => {
    const id = requiredParam(c, "id");
    await findOrThrow(id);
    const body = parseBody(await c.req.json().catch(() => ({})));
    const rows = await sql<ContactRow[]>`
      UPDATE contacts
      SET name = ${body.name}, email = ${body.email}, phone = ${body.phone ?? null},
          organization = ${body.organization ?? null}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *`;
    return c.json(success(toResponse(rows[0])));
  },
);

contactsRoutes.delete(
  "/:id",
  requireRole("DEV", "GENERAL_MANAGER"),
  async (c) => {
    const id = requiredParam(c, "id");
    await findOrThrow(id);
    await sql`DELETE FROM contacts WHERE id = ${id}`;
    return c.body(null, 204);
  },
);
