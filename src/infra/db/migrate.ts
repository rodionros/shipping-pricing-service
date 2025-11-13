import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db, client } from "./client";
import fs from "fs";
import path from "path";

const MIGRATIONS_FOLDER = path.resolve(process.cwd(), "drizzle");
const JOURNAL_PATH = path.join(MIGRATIONS_FOLDER, "meta", "_journal.json");

async function applyFallbackSchema() {
    console.warn("Applying fallback schema...");

    await db.execute(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

    await db.execute(`
        CREATE TABLE IF NOT EXISTS shipping_requests (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            weight_kg NUMERIC(10,2) NOT NULL,
            width_cm NUMERIC(10,2) NOT NULL,
            height_cm NUMERIC(10,2) NOT NULL,
            length_cm NUMERIC(10,2) NOT NULL,
            amount NUMERIC(12,2) NOT NULL,
            city TEXT NOT NULL,
            postal_code TEXT NOT NULL,
            street TEXT NOT NULL,
            country TEXT NOT NULL
        );
    `);

    // 3) варианты доставки (из schema.ts: shippingQuotes)
    await db.execute(`
        CREATE TABLE IF NOT EXISTS shipping_quotes (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            request_id UUID NOT NULL REFERENCES shipping_requests(id),
            provider_code TEXT NOT NULL,
            service_name TEXT NOT NULL,
            price INTEGER NOT NULL,
            currency TEXT NOT NULL,
            min_days INTEGER NOT NULL,
            max_days INTEGER NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
    `);

    // 4) справочник провайдеров (как у тебя был)
    await db.execute(`
        CREATE TABLE IF NOT EXISTS shipping_providers (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            code VARCHAR(64) NOT NULL UNIQUE,
            name VARCHAR(255) NOT NULL,
            is_active BOOLEAN NOT NULL DEFAULT TRUE,
            created_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
    `);

    // 5) логи запросов к провайдерам (как у тебя был)
    await db.execute(`
        CREATE TABLE IF NOT EXISTS shipping_quote_logs (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            request_id VARCHAR(64) NOT NULL,
            provider_code VARCHAR(64) NOT NULL,
            success BOOLEAN NOT NULL,
            duration_ms INTEGER NOT NULL,
            error_message TEXT NULL,
            cache_hit BOOLEAN NOT NULL DEFAULT FALSE,
            created_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
    `);
}

async function main() {
    try {
        if (fs.existsSync(JOURNAL_PATH)) {
            console.log("Running Drizzle migrations from", MIGRATIONS_FOLDER);
            await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
        } else {
            console.warn(
                `No migration journal found at ${JOURNAL_PATH}, applying fallback schema`
            );
            await applyFallbackSchema();
        }
    } catch (err) {
        console.error("Migration failed, applying fallback schema...", err);
        try {
            await applyFallbackSchema();
        } catch (fallbackErr) {
            console.error("Fallback schema failed", fallbackErr);
            process.exitCode = 1;
        }
    } finally {
        await client.end();
    }
}

main();