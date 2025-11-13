import Elysia, { t } from "elysia";
import swagger from "@elysiajs/swagger";
import { registerShippingRoutes } from "./routes/shipping";
import { createErrorHandler } from "./error-handler";
import type { ShippingService } from "@app/services/shipping.service";

export function createServer(shippingService: ShippingService) {
    const app = new Elysia()
        .use(
            swagger({
                documentation: {
                    info: {
                        title: "Shipping Pricing Service",
                        version: "1.0.0"
                    }
                }
            })
        )
        .onError(createErrorHandler());

    registerShippingRoutes(app, shippingService);

    app.get(
        "/health",
        () => ({ status: "ok" }),
        {
            response: {
                200: t.Object({
                    status: t.String()
                })
            },
            detail: {
                tags: ["System"],
                summary: "Проверка работоспособности сервиса"
            }
        }
    );

    return app;
}