import { ShipmentRequest, DeliveryOption } from "../entities/shipping";

export interface ShippingProvider {
    readonly code: string;
    getQuotes(request: ShipmentRequest): Promise<DeliveryOption[]>;
}