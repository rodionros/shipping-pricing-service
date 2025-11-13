import type { ShippingRequestRepository } from "@domain/repositories/shipping-request.repository";
import type { ShipmentRequest } from "@domain/entities/shipping";
import { db } from "../db/client";
import { shippingRequests } from "../db/schema";

export class DrizzleShippingRequestRepository implements ShippingRequestRepository {
    async save(request: ShipmentRequest): Promise<void> {
        await db.insert(shippingRequests).values({
            id: request.id,
            createdAt: request.createdAt,
            weightKg: request.weightKg.toString(),
            widthCm: request.widthCm.toString(),
            heightCm: request.heightCm.toString(),
            lengthCm: request.lengthCm.toString(),
            amount: request.amount.toString(),
            city: request.address.city,
            postalCode: request.address.postalCode,
            street: request.address.street,
            country: request.address.country
        });
    }
}