import Redis from "ioredis";
import { env } from "../../config/env";

export interface Cache {
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, ttlSeconds: number): Promise<void>;
}

export class RedisCache implements Cache {
    private readonly client: Redis;

    constructor() {
        this.client = new Redis(env.redisUrl);
    }

    async get<T>(key: string): Promise<T | null> {
        const raw = await this.client.get(key);
        if (!raw) return null;
        return JSON.parse(raw) as T;
    }

    async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
        const data = JSON.stringify(value);
        await this.client.set(key, data, "EX", ttlSeconds);
    }
}