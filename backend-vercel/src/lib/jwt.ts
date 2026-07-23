import jwt from "jsonwebtoken";
import { env } from "../env.js";
import type { UserRole } from "../types.js";

export interface TokenClaims {
  sub: string;
  email: string;
  role: UserRole;
  restaurantId: string | null;
}

export function generateToken(
  userId: string,
  email: string,
  role: UserRole,
  restaurantId: string | null,
): string {
  return jwt.sign(
    { email, role, restaurantId },
    env.jwtSecret,
    { subject: userId, expiresIn: Math.floor(env.jwtExpirationMs / 1000), algorithm: "HS256" },
  );
}

export function verifyToken(token: string): TokenClaims | null {
  try {
    const payload = jwt.verify(token, env.jwtSecret, { algorithms: ["HS256"] });
    if (typeof payload === "string" || !payload.sub) return null;
    return {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
      restaurantId: payload.restaurantId ?? null,
    };
  } catch {
    return null;
  }
}
