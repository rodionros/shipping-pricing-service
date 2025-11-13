import { RedisQueue } from "@infra/redis/queue";

async function runWorker() {
    const queue = new RedisQueue();

    console.log("Worker started, listening for events...");

    await queue.consume(async (eventType, payload) => {
        // Здесь может быть бизнес-логика уведомлений, ретраев, интеграций и т.п.
        console.log("Worker received event:", {
            eventType,
            payload
        });
    });
}

runWorker().catch((err) => {
    console.error("Worker failed", err);
    process.exit(1);
});