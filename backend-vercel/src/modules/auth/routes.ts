import { Hono } from "hono";
import { z } from "zod";
import { sql } from "../../db.js";
import { verifyPassword } from "../../lib/password.js";
import { generateToken } from "../../lib/jwt.js";
import { success } from "../../lib/response.js";
import { BadCredentialsError, BadRequestError } from "../../lib/errors.js";
import type { AppEnv } from "../../middleware/auth.js";
import type { UserRole } from "../../types.js";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const authRoutes = new Hono<AppEnv>();

authRoutes.post("/login", async (c) => {
  const parsed = loginSchema.safeParse(await c.req.json().catch(() => ({})));
  if (!parsed.success) {
    throw new BadRequestError(parsed.error.issues.map((i) => i.message).join("; "));
  }
  const { email, password } = parsed.data;

  const rows = await sql<
    { id: string; restaurant_id: string | null; email: string; password_hash: string; role: UserRole }[]
  >`SELECT id, restaurant_id, email, password_hash, role FROM users WHERE email = ${email}`;

  const user = rows[0];
  if (!user || !(await verifyPassword(password, user.password_hash))) {
    throw new BadCredentialsError();
  }

  const token = generateToken(user.id, user.email, user.role, user.restaurant_id);

  return c.json(
    success({
      token,
      userId: user.id,
      email: user.email,
      role: user.role,
      restaurantId: user.restaurant_id,
    }),
  );
});
