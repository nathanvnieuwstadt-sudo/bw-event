import { Hono } from "hono";
import { z } from "zod";
import { sql } from "../../db.js";
import { hashPassword } from "../../lib/password.js";
import { success } from "../../lib/response.js";
import { NotFoundError, BadRequestError } from "../../lib/errors.js";
import { requireAuth, requireRole, getAuth } from "../../middleware/auth.js";
import type { AppEnv } from "../../middleware/auth.js";
import type { UserRole } from "../../types.js";
import { requiredParam } from "../../lib/params.js";

// DEV is deliberately not assignable here — it's the vendor/maintenance
// role, not something restaurant staff should be able to grant.
const STAFF_ROLES = ["OWNER", "GENERAL_MANAGER", "FLOOR_MANAGER", "KITCHEN"] as const;

const createStaffSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(STAFF_ROLES),
});

interface StaffRow {
  id: string;
  restaurant_id: string | null;
  email: string;
  role: UserRole;
  created_at: string;
}

function toResponse(u: StaffRow) {
  return {
    id: u.id,
    restaurantId: u.restaurant_id,
    email: u.email,
    role: u.role,
    createdAt: u.created_at,
  };
}

function parseBody(body: unknown) {
  const parsed = createStaffSchema.safeParse(body);
  if (!parsed.success) {
    throw new BadRequestError(parsed.error.issues.map((i) => i.message).join("; "));
  }
  return parsed.data;
}

export const staffRoutes = new Hono<AppEnv>();

staffRoutes.use("*", requireAuth);

staffRoutes.get("/", requireRole("DEV", "GENERAL_MANAGER"), async (c) => {
  const restaurantId = requiredParam(c, "restaurantId");
  const rows = await sql<StaffRow[]>`
    SELECT id, restaurant_id, email, role, created_at FROM users
    WHERE restaurant_id = ${restaurantId} ORDER BY email ASC`;
  return c.json(success(rows.map(toResponse)));
});

staffRoutes.post("/", requireRole("DEV", "GENERAL_MANAGER"), async (c) => {
  const restaurantId = requiredParam(c, "restaurantId");
  const body = parseBody(await c.req.json().catch(() => ({})));

  const existing = await sql<{ id: string }[]>`SELECT id FROM users WHERE email = ${body.email}`;
  if (existing[0]) throw new BadRequestError(`Email already in use: ${body.email}`);

  const passwordHash = await hashPassword(body.password);
  const rows = await sql<StaffRow[]>`
    INSERT INTO users (restaurant_id, email, password_hash, role)
    VALUES (${restaurantId}, ${body.email}, ${passwordHash}, ${body.role})
    RETURNING id, restaurant_id, email, role, created_at`;
  return c.json(success(toResponse(rows[0])), 201);
});

staffRoutes.delete("/:id", requireRole("DEV", "GENERAL_MANAGER"), async (c) => {
  const restaurantId = requiredParam(c, "restaurantId");
  const id = requiredParam(c, "id");
  const auth = getAuth(c);
  if (id === auth.userId) throw new BadRequestError("You cannot remove your own account");

  const rows = await sql<{ id: string }[]>`
    SELECT id FROM users WHERE id = ${id} AND restaurant_id = ${restaurantId}`;
  if (!rows[0]) throw new NotFoundError(`User not found: ${id}`);

  await sql`DELETE FROM users WHERE id = ${id}`;
  return c.body(null, 204);
});
