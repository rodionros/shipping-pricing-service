import type { ShippingProvider } from "@domain/providers/shipping.provider";
import { ShipmentRequest, DeliveryOption } from "@domain/entities/shipping";

export class MockCdekProvider implements ShippingProvider {
    public readonly code = "mock_cdek";

    async getQuotes(request: ShipmentRequest): Promise<DeliveryOption[]> {
        const basePrice = Math.ceil(request.weightKg * 100);

        const minDays = 3;
        const maxDays = 5 + Math.floor(request.weightKg / 10);

        const option = new DeliveryOption(
            this.code,
            "Mock CDEK Стандарт",
            basePrice,
            "RUB",
            minDays,
            maxDays
        );

        return [option];
    }
}