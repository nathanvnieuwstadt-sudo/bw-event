function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

export const env = {
  get databaseUrl() {
    return required("DATABASE_URL");
  },
  get jwtSecret() {
    return required("JWT_SECRET");
  },
  get jwtExpirationMs() {
    return Number(process.env.JWT_EXPIRATION_MS ?? 86_400_000);
  },
};
