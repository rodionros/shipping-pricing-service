import { env } from "./config/env";
import { DrizzleShippingRequestRepository } from "@infra/repositories/drizzle.shipping-request.repository";
import { DrizzleShippingQuoteRepository } from "@infra/repositories/drizzle.shipping-quote.repository";

import { ShippingService } from "@app/services/shipping.service";
import { createServer } from "@infra/http/server";
import {MockCdekProvider} from "@infra/providers/mock.sdek.provider";
import {MockBoxberryProvider} from "@infra/providers/mock.boxberry.provider";
import {RedisQueue} from "@infra/redis/queue";
import {RedisCache} from "@infra/redis/cache";

async function bootstrap() {
    const requestRepo = new DrizzleShippingRequestRepository();
    const quoteRepo = new DrizzleShippingQuoteRepository();
    const cache = new RedisCache();
    const queue = new RedisQueue();

    const providers = [new MockCdekProvider(), new MockBoxberryProvider()];

    const shippingService = new ShippingService({
        providers,
        requestRepository: requestRepo,
        quoteRepository: quoteRepo,
        cache,
        queue,
        providerTimeoutMs: 2000
    });

    const app = createServer(shippingService);

    app.listen(env.port);
    console.log(`🚚 Shipping service is running on http://localhost:${env.port}`);
}

bootstrap().catch((err) => {
    console.error("Failed to start application", err);
    process.exit(1);
});