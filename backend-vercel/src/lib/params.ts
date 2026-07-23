import type { Context } from "hono";
import { BadRequestError } from "./errors.js";

/**
 * Hono only narrows c.req.param()'s return type to `string` when the path
 * literal is threaded through every handler in a `.get/.post(...)` call; once
 * middleware is chained in, or the param comes from a parent `.route()`
 * mount path, it types as `string | undefined`. This asserts presence
 * (always true at runtime for a matched route) and gives call sites a plain
 * `string`.
 */
export function requiredParam(c: Context, name: string): string {
  const value = c.req.param(name);
  if (!value) throw new BadRequestError(`Missing path parameter: ${name}`);
  return value;
}
