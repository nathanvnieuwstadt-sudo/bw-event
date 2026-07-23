import { Hono } from "hono";
import { sql } from "../../db.js";
import { success } from "../../lib/response.js";
import { NotFoundError } from "../../lib/errors.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import type { AppEnv } from "../../middleware/auth.js";
import type { AgentMode } from "../../types.js";
import { requiredParam } from "../../lib/params.js";

export const restaurantsRoutes = new Hono<AppEnv>();

restaurantsRoutes.use("*", requireAuth);

restaurantsRoutes.get(
  "/:id",
  requireRole("DEV", "OWNER", "GENERAL_MANAGER", "FLOOR_MANAGER", "KITCHEN"),
  async (c) => {
    const id = requiredParam(c, "id");
    const rows = await sql<
      { id: string; name: string; agent_mode: AgentMode; created_at: string }[]
    >`SELECT id, name, agent_mode, created_at FROM restaurants WHERE id = ${id}`;
    const restaurant = rows[0];
    if (!restaurant) throw new NotFoundError(`Restaurant not found: ${id}`);
    return c.json(
      success({
        id: restaurant.id,
        name: restaurant.name,
        agentMode: restaurant.agent_mode,
        createdAt: restaurant.created_at,
      }),
    );
  },
);
