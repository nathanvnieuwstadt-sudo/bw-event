import { Hono } from "hono";
import { z } from "zod";
import { sql } from "../../db.js";
import { success } from "../../lib/response.js";
import { NotFoundError, BadRequestError } from "../../lib/errors.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import type { AppEnv } from "../../middleware/auth.js";
import { requiredParam } from "../../lib/params.js";

const instructionSchema = z.object({
  title: z.string().min(1),
  instruction: z.string().min(1),
  enabled: z.boolean().optional(),
  displayOrder: z.number().int().optional(),
});

interface InstructionRow {
  id: string;
  restaurant_id: string;
  title: string;
  instruction: string;
  enabled: boolean;
  display_order: number;
  created_at: string;
}

function toResponse(i: InstructionRow) {
  return {
    id: i.id,
    restaurantId: i.restaurant_id,
    title: i.title,
    instruction: i.instruction,
    enabled: i.enabled,
    displayOrder: i.display_order,
    createdAt: i.created_at,
  };
}

async function findOrThrow(id: string): Promise<InstructionRow> {
  const rows = await sql<InstructionRow[]>`SELECT * FROM agent_instructions WHERE id = ${id}`;
  const row = rows[0];
  if (!row) throw new NotFoundError(`AgentInstruction not found: ${id}`);
  return row;
}

function parseBody(body: unknown) {
  const parsed = instructionSchema.safeParse(body);
  if (!parsed.success) {
    throw new BadRequestError(parsed.error.issues.map((i) => i.message).join("; "));
  }
  return parsed.data;
}

export const agentInstructionsRoutes = new Hono<AppEnv>();

agentInstructionsRoutes.use("*", requireAuth);

agentInstructionsRoutes.get(
  "/",
  requireRole("DEV", "GENERAL_MANAGER", "FLOOR_MANAGER"),
  async (c) => {
    const restaurantId = requiredParam(c, "restaurantId");
    const rows = await sql<InstructionRow[]>`
      SELECT * FROM agent_instructions
      WHERE restaurant_id = ${restaurantId}
      ORDER BY display_order ASC, created_at ASC`;
    return c.json(success(rows.map(toResponse)));
  },
);

agentInstructionsRoutes.post("/", requireRole("DEV", "GENERAL_MANAGER"), async (c) => {
  const restaurantId = requiredParam(c, "restaurantId");
  const body = parseBody(await c.req.json().catch(() => ({})));
  const rows = await sql<InstructionRow[]>`
    INSERT INTO agent_instructions (restaurant_id, title, instruction, enabled, display_order)
    VALUES (${restaurantId}, ${body.title}, ${body.instruction}, ${body.enabled ?? true}, ${body.displayOrder ?? 0})
    RETURNING *`;
  return c.json(success(toResponse(rows[0])), 201);
});

agentInstructionsRoutes.put("/:id", requireRole("DEV", "GENERAL_MANAGER"), async (c) => {
  const id = requiredParam(c, "id");
  await findOrThrow(id);
  const body = parseBody(await c.req.json().catch(() => ({})));
  const rows = await sql<InstructionRow[]>`
    UPDATE agent_instructions
    SET title = ${body.title}, instruction = ${body.instruction},
        enabled = ${body.enabled ?? true}, display_order = ${body.displayOrder ?? 0}
    WHERE id = ${id}
    RETURNING *`;
  return c.json(success(toResponse(rows[0])));
});

agentInstructionsRoutes.delete("/:id", requireRole("DEV", "GENERAL_MANAGER"), async (c) => {
  const id = requiredParam(c, "id");
  await sql`DELETE FROM agent_instructions WHERE id = ${id}`;
  return c.body(null, 204);
});
