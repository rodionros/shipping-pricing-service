import type { ShippingQuoteRepository } from "@domain/repositories/shipping-quote.repository";
import type { ShipmentRequest, DeliveryOption } from "@domain/entities/shipping";
import { db } from "../db/client";
import { shippingQuotes } from "../db/schema";
import { v4 as uuidv4 } from "uuid";

export class DrizzleShippingQuoteRepository implements ShippingQuoteRepository {
    async saveMany(
        request: ShipmentRequest,
        options: DeliveryOption[]
    ): Promise<void> {
        if (options.length === 0) return;

        await db.insert(shippingQuotes).values(
            options.map((opt) => ({
                id: uuidv4(),
                requestId: request.id,
                providerCode: opt.providerCode,
                serviceName: opt.serviceName,
                price: opt.price,
                currency: opt.currency,
                minDays: opt.minDays,
                maxDays: opt.maxDays
            }))
        );
    }
}