export const env = {
    port: Number(process.env.PORT ?? 3000),
    databaseUrl:
        process.env.DATABASE_URL ??
        "postgres://app:app@localhost:5432/shipping_db",
    redisUrl: process.env.REDIS_URL ?? "redis://localhost:6379",
    nodeEnv: process.env.NODE_ENV ?? "development"
};