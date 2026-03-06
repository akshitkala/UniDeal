import { Redis } from '@upstash/redis';

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function rateLimit(
    key: string,
    limit: number,
    windowSeconds: number
): Promise<{ allowed: boolean; count: number; remaining: number }> {
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, windowSeconds);
    return {
        allowed: count <= limit,
        count,
        remaining: Math.max(0, limit - count),
    };
}
