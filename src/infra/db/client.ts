import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

const url = process.env.DATABASE_URL!;
export const client = postgres(url, { prepare: true, max: 10, onnotice: () => {} });
export const db = drizzle(client, { logger: process.env.DRIZZLE_LOG === "true" });
