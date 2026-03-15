import { Queue } from 'bullmq';
import Redis from 'ioredis';

// Global cache to prevent multiple queue instances during HMR in development
const globalForQueue = global as unknown as { _tradeQueue?: Queue };

export function getTradeQueue(): Queue {
    if (!globalForQueue._tradeQueue) {
        // BullMQ requires maxRetriesPerRequest: null for ioredis
        const connection = process.env.REDIS_URL
            ? new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: null, family: 0 })
            : {
                host: process.env.REDIS_HOST || 'localhost',
                port: parseInt(process.env.REDIS_PORT || '6379', 10),
            };

        globalForQueue._tradeQueue = new Queue('qa-test-queue', { connection: connection as any });
    }
    return globalForQueue._tradeQueue;
}
