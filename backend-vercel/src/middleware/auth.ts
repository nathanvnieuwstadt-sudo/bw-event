import type { Context, Next } from "hono";
import { verifyToken } from "../lib/jwt.js";
import { HttpError, ForbiddenError } from "../lib/errors.js";
import type { AuthContext, UserRole } from "../types.js";

export type AppEnv = { Variables: { auth?: AuthContext } };

/** Parses the Authorization header and attaches the auth context if the token is valid. Never rejects. */
export async function attachAuth(c: Context<AppEnv>, next: Next) {
  const header = c.req.header("Authorization");
  if (header?.startsWith("Bearer ")) {
    const claims = verifyToken(header.slice(7));
    if (claims) {
      c.set("auth", {
        userId: claims.sub,
        email: claims.email,
        role: claims.role,
        restaurantId: claims.restaurantId,
      });
    }
  }
  await next();
}

/** Rejects the request unless a valid token was attached. */
export async function requireAuth(c: Context<AppEnv>, next: Next) {
  if (!c.get("auth")) {
    throw new HttpError(401, "Unauthorized");
  }
  await next();
}

/** Rejects the request unless the authenticated user has one of the given roles. */
export function requireRole(...roles: UserRole[]) {
  return async (c: Context<AppEnv>, next: Next) => {
    const auth = c.get("auth");
    if (!auth) throw new HttpError(401, "Unauthorized");
    if (!roles.includes(auth.role)) throw new ForbiddenError();
    await next();
  };
}

export function getAuth(c: Context<AppEnv>): AuthContext {
  const auth = c.get("auth");
  if (!auth) throw new HttpError(401, "Unauthorized");
  return auth;
}
