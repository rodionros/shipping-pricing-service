import { v4 as uuidv4 } from "uuid";
import type {
    ShippingRequestDTO,
    ShippingResponseDTO,
    DeliveryOptionDTO
} from "../dto/shipping.dto";
import { Address } from "@domain/entities/address";
import { DeliveryOption, ShipmentRequest } from "@domain/entities/shipping";
import type { ShippingProvider } from "@domain/providers/shipping.provider";
import type { ShippingRequestRepository } from "@domain/repositories/shipping-request.repository";
import type { ShippingQuoteRepository } from "@domain/repositories/shipping-quote.repository";
import {Cache} from "@infra/redis/cache";
import {Queue} from "@infra/redis/queue";


export interface ShippingServiceDependencies {
    providers: ShippingProvider[];
    requestRepository: ShippingRequestRepository;
    quoteRepository: ShippingQuoteRepository;
    cache: Cache;
    queue: Queue;
    providerTimeoutMs?: number;
}

export class ShippingService {
    private readonly providers: ShippingProvider[];
    private readonly requestRepository: ShippingRequestRepository;
    private readonly quoteRepository: ShippingQuoteRepository;
    private readonly cache: Cache;
    private readonly queue: Queue;
    private readonly providerTimeoutMs: number;

    constructor(deps: ShippingServiceDependencies) {
        this.providers = deps.providers;
        this.requestRepository = deps.requestRepository;
        this.quoteRepository = deps.quoteRepository;
        this.cache = deps.cache;
        this.queue = deps.queue;
        this.providerTimeoutMs = deps.providerTimeoutMs ?? 2000;
    }

    private buildCacheKey(dto: ShippingRequestDTO): string {
        const { cart, address } = dto;
        const payload = JSON.stringify({ cart, address });

        const hasher = new Bun.SHA256();
        hasher.update(payload);
        const hash = hasher.digest("hex");

        return `shipping:quote-cache:${hash}`;
    }

    public async getShippingOptions(
        dto: ShippingRequestDTO
    ): Promise<ShippingResponseDTO> {
        const cacheKey = this.buildCacheKey(dto);
        const cached = await this.cache.get<DeliveryOptionDTO[]>(cacheKey);
        if (cached) {
            return {
                requestId: "cached",
                currency: "RUB",
                options: cached,
                unavailableProviders: []
            };
        }

        const id = uuidv4();
        const address = new Address(
            dto.address.city,
            dto.address.postal_code,
            dto.address.street,
            dto.address.country
        );

        const request = new ShipmentRequest(
            id,
            dto.cart.weight_kg,
            dto.cart.width_cm,
            dto.cart.height_cm,
            dto.cart.length_cm,
            dto.cart.amount,
            address,
            new Date()
        );

        await this.requestRepository.save(request);

        const results = await Promise.allSettled(
            this.providers.map((provider) =>
                this.callProviderWithTimeout(provider, request)
            )
        );

        const options: DeliveryOption[] = [];
        const unavailableProviders: { provider: string; reason: string }[] = [];

        for (const result of results) {
            if (result.status === "fulfilled") {
                options.push(...result.value.options);
                if (result.value.error) {
                    unavailableProviders.push(result.value.error);
                }
            } else {
                const reason =
                    result.reason instanceof Error
                        ? result.reason.message
                        : "unknown_error";
                unavailableProviders.push({
                    provider: "unknown",
                    reason
                });
            }
        }

        await this.quoteRepository.saveMany(request, options);

        const dtoOptions: DeliveryOptionDTO[] = options.map((opt) => ({
            provider: opt.providerCode,
            service_name: opt.serviceName,
            price: opt.price,
            currency: opt.currency,
            estimated_days_min: opt.minDays,
            estimated_days_max: opt.maxDays
        }));

        await this.cache.set(cacheKey, dtoOptions, 60);

        await this.queue.publish("QUOTE_CALCULATED", {
            requestId: request.id,
            options: dtoOptions
        });

        return {
            requestId: request.id,
            currency: "RUB",
            options: dtoOptions,
            unavailableProviders
        };
    }

    private async callProviderWithTimeout(
        provider: ShippingProvider,
        request: ShipmentRequest
    ): Promise<{
        options: DeliveryOption[];
        error?: { provider: string; reason: string };
    }> {
        const timeoutPromise = new Promise<DeliveryOption[]>((_, reject) => {
            setTimeout(
                () => reject(new Error("timeout")),
                this.providerTimeoutMs
            );
        });

        try {
            const options = await Promise.race([
                provider.getQuotes(request),
                timeoutPromise
            ]);
            return { options };
        } catch (err) {
            const reason =
                err instanceof Error ? err.message : "provider_error";
            return {
                options: [],
                error: {
                    provider: provider.code,
                    reason
                }
            };
        }
    }
}