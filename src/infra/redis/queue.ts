import Redis from "ioredis";
import { env } from "../../config/env";

export interface Queue {
    publish(eventType: string, payload: unknown): Promise<void>;
    consume(
        handler: (eventType: string, payload: unknown) => Promise<void>
    ): Promise<void>;
}

const QUEUE_KEY = "shipping:events";

export class RedisQueue implements Queue {
    private readonly client: Redis;
    private readonly subscriber: Redis;

    constructor() {
        this.client = new Redis(env.redisUrl);
        this.subscriber = new Redis(env.redisUrl);
    }

    async publish(eventType: string, payload: unknown): Promise<void> {
        const message = JSON.stringify({
            eventType,
            payload,
            createdAt: new Date().toISOString()
        });
        await this.client.rpush(QUEUE_KEY, message);
    }

    async consume(
        handler: (eventType: string, payload: unknown) => Promise<void>
    ): Promise<void> {
        // простой бесконечный loop для worker
        // в реальном коде это можно сделать аккуратнее (graceful shutdown и т.п.)
        // но для задачи этого достаточно
        while (true) {
            const res = await this.subscriber.blpop(QUEUE_KEY, 0);
            if (!res) continue;
            const [, message] = res;
            try {
                const parsed = JSON.parse(message) as {
                    eventType: string;
                    payload: unknown;
                };
                await handler(parsed.eventType, parsed.payload);
            } catch (err) {
                console.error("Failed to process queue message", err);
            }
        }
    }
}