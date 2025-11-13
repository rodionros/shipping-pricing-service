import { ShipmentRequest } from "../entities/shipping";

export interface ShippingRequestRepository {
    save(request: ShipmentRequest): Promise<void>;
}