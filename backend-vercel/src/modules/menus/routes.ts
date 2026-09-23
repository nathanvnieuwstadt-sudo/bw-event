import { Hono } from "hono";
import { z } from "zod";
import type { TransactionSql } from "postgres";
import { sql } from "../../db.js";
import { success } from "../../lib/response.js";
import { NotFoundError, BadRequestError } from "../../lib/errors.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import type { AppEnv } from "../../middleware/auth.js";
import { requiredParam } from "../../lib/params.js";

const dishSchema = z.object({
  dishName: z.string().min(1, "Dish name is required"),
  description: z.string().nullable().optional(),
  displayOrder: z.number().int().nullable().optional(),
});

const menuSchema = z.object({
  name: z.string().min(1, "Menu name is required"),
  description: z.string().nullable().optional(),
  dishes: z.array(dishSchema).optional(),
});

interface MenuRow {
  id: string;
  restaurant_id: string;
  name: string;
  description: string | null;
  display_order: number;
  created_at: string;
}

interface DishRow {
  id: string;
  menu_id: string;
  dish_name: string;
  description: string | null;
  display_order: number;
}

function dishToResponse(d: DishRow) {
  return {
    id: d.id,
    dishName: d.dish_name,
    description: d.description,
    displayOrder: d.display_order,
  };
}

async function toResponse(m: MenuRow) {
  const dishes = await sql<DishRow[]>`
    SELECT * FROM menu_dishes WHERE menu_id = ${m.id} ORDER BY display_order ASC`;
  return {
    id: m.id,
    restaurantId: m.restaurant_id,
    name: m.name,
    description: m.description,
    displayOrder: m.display_order,
    dishes: dishes.map(dishToResponse),
    createdAt: m.created_at,
  };
}

async function findOrThrow(id: string): Promise<MenuRow> {
  const rows = await sql<MenuRow[]>`SELECT * FROM menus WHERE id = ${id}`;
  const row = rows[0];
  if (!row) throw new NotFoundError(`Menu not found: ${id}`);
  return row;
}

async function insertDishes(tx: TransactionSql, menuId: string, dishes: z.infer<typeof dishSchema>[] | undefined) {
  if (!dishes?.length) return;
  for (let i = 0; i < dishes.length; i++) {
    const d = dishes[i];
    await tx`
      INSERT INTO menu_dishes (menu_id, dish_name, description, display_order)
      VALUES (${menuId}, ${d.dishName}, ${d.description ?? null}, ${d.displayOrder ?? i})`;
  }
}

function parseBody(body: unknown) {
  const parsed = menuSchema.safeParse(body);
  if (!parsed.success) {
    throw new BadRequestError(parsed.error.issues.map((i) => i.message).join("; "));
  }
  return parsed.data;
}

export const menusRoutes = new Hono<AppEnv>();

menusRoutes.use("*", requireAuth);

menusRoutes.get(
  "/",
  requireRole("DEV", "OWNER", "GENERAL_MANAGER", "FLOOR_MANAGER"),
  async (c) => {
    const restaurantId = requiredParam(c, "restaurantId");
    const rows = await sql<MenuRow[]>`
      SELECT * FROM menus WHERE restaurant_id = ${restaurantId} ORDER BY display_order ASC, name ASC`;
    return c.json(success(await Promise.all(rows.map(toResponse))));
  },
);

menusRoutes.get(
  "/:id",
  requireRole("DEV", "OWNER", "GENERAL_MANAGER", "FLOOR_MANAGER"),
  async (c) => {
    return c.json(success(await toResponse(await findOrThrow(requiredParam(c, "id")))));
  },
);

menusRoutes.post("/", requireRole("DEV", "GENERAL_MANAGER"), async (c) => {
  const restaurantId = requiredParam(c, "restaurantId");
  const body = parseBody(await c.req.json().catch(() => ({})));

  const created = await sql.begin(async (tx) => {
    const countRows = await tx<{ count: string }[]>`
      SELECT COUNT(*)::int AS count FROM menus WHERE restaurant_id = ${restaurantId}`;
    const rows = await tx<MenuRow[]>`
      INSERT INTO menus (restaurant_id, name, description, display_order)
      VALUES (${restaurantId}, ${body.name}, ${body.description ?? null}, ${Number(countRows[0].count)})
      RETURNING *`;
    const menu = rows[0];
    await insertDishes(tx, menu.id, body.dishes);
    return menu;
  });

  return c.json(success(await toResponse(created)), 201);
});

menusRoutes.put("/:id", requireRole("DEV", "GENERAL_MANAGER"), async (c) => {
  const id = requiredParam(c, "id");
  await findOrThrow(id);
  const body = parseBody(await c.req.json().catch(() => ({})));

  const updated = await sql.begin(async (tx) => {
    const rows = await tx<MenuRow[]>`
      UPDATE menus SET name = ${body.name}, description = ${body.description ?? null}
      WHERE id = ${id}
      RETURNING *`;
    await tx`DELETE FROM menu_dishes WHERE menu_id = ${id}`;
    await insertDishes(tx, id, body.dishes);
    return rows[0];
  });

  return c.json(success(await toResponse(updated)));
});

menusRoutes.delete("/:id", requireRole("DEV", "GENERAL_MANAGER"), async (c) => {
  const id = requiredParam(c, "id");
  await findOrThrow(id);
  await sql`DELETE FROM menus WHERE id = ${id}`;
  return c.body(null, 204);
});
