import { Hono } from "hono";
import { sql } from "../../db.js";
import { success } from "../../lib/response.js";
import { NotFoundError } from "../../lib/errors.js";
import { requireAuth, requireRole, getAuth } from "../../middleware/auth.js";
import type { AppEnv } from "../../middleware/auth.js";
import type { UserRole } from "../../types.js";
import { requiredParam } from "../../lib/params.js";

async function findUserById(id: string) {
  const rows = await sql<
    { id: string; restaurant_id: string | null; email: string; role: UserRole; created_at: string }[]
  >`SELECT id, restaurant_id, email, role, created_at FROM users WHERE id = ${id}`;
  const user = rows[0];
  if (!user) throw new NotFoundError(`User not found: ${id}`);
  return {
    id: user.id,
    restaurantId: user.restaurant_id,
    email: user.email,
    role: user.role,
    createdAt: user.created_at,
  };
}

export const usersRoutes = new Hono<AppEnv>();

usersRoutes.use("*", requireAuth);

usersRoutes.get("/me", async (c) => {
  const auth = getAuth(c);
  return c.json(success(await findUserById(auth.userId)));
});

usersRoutes.get("/:id", requireRole("DEV"), async (c) => {
  return c.json(success(await findUserById(requiredParam(c, "id"))));
});
