import { t } from "elysia";
import type { ShippingService } from "@app/services/shipping.service";
import { shippingRequestSchema } from "@app/validation/shipping-request.schema";

export function registerShippingRoutes(app: any, shippingService: ShippingService): void {
    app.post(
        "/shipping/quotes",
        async ({ body }: { body: unknown }) => {
            const parsed = shippingRequestSchema.parse(body);
            const response = await shippingService.getShippingOptions(parsed);
            return response;
        },
        {
            body: t.Object({
                cart: t.Object({
                    weight_kg: t.Number({ minimum: 0.05 }),
                    width_cm: t.Number({ minimum: 1 }),
                    height_cm: t.Number({ minimum: 1 }),
                    length_cm: t.Number({ minimum: 1 }),
                    amount: t.Number({ minimum: 1 })
                }),
                address: t.Object({
                    city: t.String(),
                    postal_code: t.String(),
                    street: t.String(),
                    country: t.String()
                })
            }, {
                example: {
                    cart: {
                        weight_kg: 4.2,
                        width_cm: 30,
                        height_cm: 20,
                        length_cm: 40,
                        amount: 3500
                    },
                    address: {
                        city: "Москва",
                        postal_code: "101000",
                        street: "Тверская, 1",
                        country: "RU"
                    }
                }
            }),
            response: {
                200: t.Object({
                    requestId: t.String(),
                    currency: t.String(),
                    options: t.Array(
                        t.Object({
                            provider: t.String(),
                            service_name: t.String(),
                            price: t.Number(),
                            currency: t.String(),
                            estimated_days_min: t.Number(),
                            estimated_days_max: t.Number()
                        })
                    ),
                    unavailableProviders: t.Array(
                        t.Object({
                            provider: t.String(),
                            reason: t.String()
                        })
                    )
                }, {
                    example: {
                        requestId: "b97c7326-57cb-40c6-a8e7-f167d2b2f2e6",
                        currency: "RUB",
                        options: [
                            {
                                provider: "cdek",
                                service_name: "Курьер до двери",
                                price: 420,
                                currency: "RUB",
                                estimated_days_min: 3,
                                estimated_days_max: 5
                            },
                            {
                                provider: "boxberry",
                                service_name: "ПВЗ Экспресс",
                                price: 300,
                                currency: "RUB",
                                estimated_days_min: 2,
                                estimated_days_max: 4
                            }
                        ],
                        unavailableProviders: []
                    }
                })
            },
            detail: {
                tags: ["Shipping"],
                summary: "Получить варианты доставки",
                description:
                    "Принимает данные корзины и адрес, возвращает список вариантов доставки от всех подключенных провайдеров."
            }
        }
    );
}