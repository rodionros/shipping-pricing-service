import { Address } from "./address";

export class ShipmentRequest {
    constructor(
        public readonly id: string,
        public readonly weightKg: number,
        public readonly widthCm: number,
        public readonly heightCm: number,
        public readonly lengthCm: number,
        public readonly amount: number,
        public readonly address: Address,
        public readonly createdAt: Date
    ) {
        if (weightKg <= 0) throw new Error("Weight must be positive");
        if (widthCm <= 0 || heightCm <= 0 || lengthCm <= 0) {
            throw new Error("Dimensions must be positive");
        }
        if (amount < 0) throw new Error("Amount cannot be negative");
    }
}

export class DeliveryOption {
    constructor(
        public readonly providerCode: string,
        public readonly serviceName: string,
        public readonly price: number,
        public readonly currency: string,
        public readonly minDays: number,
        public readonly maxDays: number
    ) {
        if (price < 0) throw new Error("Price cannot be negative");
        if (minDays <= 0 || maxDays <= 0 || maxDays < minDays) {
            throw new Error("Delivery days are invalid");
        }
    }
}