import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { ZodError } from "zod";
import { attachAuth } from "./middleware/auth.js";
import type { AppEnv } from "./middleware/auth.js";
import { errorBody } from "./lib/response.js";
import { HttpError } from "./lib/errors.js";
import { authRoutes } from "./modules/auth/routes.js";
import { usersRoutes } from "./modules/users/routes.js";
import { restaurantsRoutes } from "./modules/restaurants/routes.js";
import { contactsRoutes } from "./modules/contacts/routes.js";
import { eventTypesRoutes } from "./modules/eventTypes/routes.js";
import { banquetsRoutes } from "./modules/banquets/routes.js";
import { agentDraftsRoutes } from "./modules/agent/drafts.routes.js";
import { agentInstructionsRoutes } from "./modules/agent/instructions.routes.js";

export const app = new Hono<AppEnv>().basePath("/api/v1");

app.use(
  "*",
  cors({
    // Mirrors CorsConfig: allow any origin while still allowing credentials
    // (reflecting the request origin, since a literal "*" can't be combined
    // with credentials in browsers).
    origin: (origin) => origin ?? "*",
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["*"],
    exposeHeaders: ["Authorization"],
    credentials: true,
  }),
);

app.use("*", attachAuth);

app.get("/actuator/health", (c) => c.json({ status: "UP" }));

app.route("/auth", authRoutes);
app.route("/users", usersRoutes);
app.route("/restaurants", restaurantsRoutes);
app.route("/restaurants/:restaurantId/contacts", contactsRoutes);
app.route("/restaurants/:restaurantId/event-types", eventTypesRoutes);
app.route("/restaurants/:restaurantId/banquets", banquetsRoutes);
app.route("/restaurants/:restaurantId/agent/drafts", agentDraftsRoutes);
app.route("/restaurants/:restaurantId/agent/instructions", agentInstructionsRoutes);

app.notFound((c) => c.json(errorBody("Not found", 404), 404));

app.onError((err, c) => {
  if (err instanceof HttpError) {
    return c.json(errorBody(err.message, err.status), err.status as never);
  }
  if (err instanceof ZodError) {
    const message = err.issues.map((i) => i.message).join("; ");
    return c.json(errorBody(message, 400), 400);
  }
  if (err instanceof HTTPException) {
    return c.json(errorBody(err.message, err.status), err.status);
  }
  console.error("Unhandled error", err);
  return c.json(errorBody("Internal server error", 500), 500);
});
