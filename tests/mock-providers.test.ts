import { describe, it, expect } from "bun:test";
import { MockCdekProvider } from "src/infra/providers/mock.sdek.provider";
import { MockBoxberryProvider } from "src/infra/providers/mock.boxberry.provider";
import { Address } from "src/domain/entities/address";
import { ShipmentRequest } from "src/domain/entities/shipping";

function createRequest(params?: Partial<{
    weightKg: number;
    city: string;
}>) {
    const weightKg = params?.weightKg ?? 2;
    const city = params?.city ?? "Москва";

    const address = new Address(city, "101000", "Улица, 1", "RU");

    return new ShipmentRequest(
        "test-request-id",
        weightKg,
        10,
        10,
        10,
        1000,
        address,
        new Date()
    );
}

describe("MockCdekProvider", () => {
    it("calculates price as 100 RUB per kg", async () => {
        const provider = new MockCdekProvider();
        const request = createRequest({ weightKg: 3.4 });

        const options = await provider.getQuotes(request);

        expect(options.length).toBe(1);
        expect(options[0]?.price).toBe(Math.ceil(3.4 * 100));
        expect(options[0]?.providerCode).toBe("mock_cdek");
    });
});

describe("MockBoxberryProvider", () => {
    it("uses city tariff for Moscow", async () => {
        const provider = new MockBoxberryProvider();
        const request = createRequest({ city: "Москва" });

        const [option] = await provider.getQuotes(request);
        expect(option?.price).toBe(300);
        expect(option?.providerCode).toBe("mock_boxberry");
    });

    it("uses default tariff for unknown city", async () => {
        const provider = new MockBoxberryProvider();
        const request = createRequest({ city: "Новосибирск" });

        const [option] = await provider.getQuotes(request);
        expect(option?.price).toBe(700);
    });
});