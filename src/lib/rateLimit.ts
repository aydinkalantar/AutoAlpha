import Redis from 'ioredis';

const redisClient = process.env.REDIS_URL 
    ? new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: null, lazyConnect: true, family: 0 }) 
    : new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        lazyConnect: true,
        maxRetriesPerRequest: null
    });

/**
 * Basic Redis-backed Rate Limiter
 * @param ip Client IP address or unique identifier
 * @param action The specific action being limited (e.g. 'login', 'webhook')
 * @param limit Maximum number of requests allowed within the window
 * @param windowSeconds Time window in seconds
 * @returns boolean where true means allowed, false means rate limited
 */
export async function checkRateLimit(ip: string, action: string, limit: number, windowSeconds: number): Promise<boolean> {
    const key = `rate_limit:${action}:${ip}`;
    
    try {
        const currentCount = await redisClient.incr(key);
        
        // If this is the first request, set the expiration
        if (currentCount === 1) {
            await redisClient.expire(key, windowSeconds);
        }

        return currentCount <= limit;
    } catch (e) {
        // Fail open if Redis is down, or log warning
        console.warn(`[RateLimit] Error checking rate limit for ${key}:`, e);
        return true; 
    }
}
