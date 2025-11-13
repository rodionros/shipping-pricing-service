import { DeliveryOption, ShipmentRequest } from "../entities/shipping";

export interface ShippingQuoteRepository {
    saveMany(request: ShipmentRequest, options: DeliveryOption[]): Promise<void>;
}