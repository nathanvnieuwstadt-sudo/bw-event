import bcrypt from "bcryptjs";

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}
