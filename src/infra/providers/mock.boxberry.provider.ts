import type { ShippingProvider } from "@domain/providers/shipping.provider";
import { ShipmentRequest, DeliveryOption } from "@domain/entities/shipping";

export class MockBoxberryProvider implements ShippingProvider {
    public readonly code = "mock_boxberry";

    private readonly cityTariffs: Record<string, number> = {
        "Москва": 300,
        "Казань": 500
    };

    async getQuotes(request: ShipmentRequest): Promise<DeliveryOption[]> {
        const city = request.address.city;
        const base = this.cityTariffs[city] ?? 700;

        const option = new DeliveryOption(
            this.code,
            "Mock Boxberry Курьер",
            base,
            "RUB",
            2,
            4
        );

        return [option];
    }
}