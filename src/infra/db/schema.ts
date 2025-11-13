import {
    pgTable,
    text,
    timestamp,
    numeric,
    uuid,
    integer
} from "drizzle-orm/pg-core";

export const shippingRequests = pgTable("shipping_requests", {
    id: uuid("id").primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    weightKg: numeric("weight_kg", { precision: 10, scale: 2 }).notNull(),
    widthCm: numeric("width_cm", { precision: 10, scale: 2 }).notNull(),
    heightCm: numeric("height_cm", { precision: 10, scale: 2 }).notNull(),
    lengthCm: numeric("length_cm", { precision: 10, scale: 2 }).notNull(),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    city: text("city").notNull(),
    postalCode: text("postal_code").notNull(),
    street: text("street").notNull(),
    country: text("country").notNull()
});

export const shippingQuotes = pgTable("shipping_quotes", {
    id: uuid("id").primaryKey(),
    requestId: uuid("request_id")
        .notNull()
        .references(() => shippingRequests.id),
    providerCode: text("provider_code").notNull(),
    serviceName: text("service_name").notNull(),
    price: integer("price").notNull(),
    currency: text("currency").notNull(),
    minDays: integer("min_days").notNull(),
    maxDays: integer("max_days").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});