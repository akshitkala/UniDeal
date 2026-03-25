interface CacheEntry {
    data: any;
    expiresAt: number;
}

declare global {
    var _memCache: Map<string, CacheEntry>;
}

if (!global._memCache) {
    global._memCache = new Map();
}

export function setCache(key: string, data: any, ttlSeconds: number) {
    global._memCache.set(key, {
        data,
        expiresAt: Date.now() + ttlSeconds * 1000,
    });
}

export function getCache<T = any>(key: string): T | null {
    const entry = global._memCache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
        global._memCache.delete(key);
        return null;
    }
    return entry.data as T;
}

export function invalidateCache(key: string) {
    global._memCache.delete(key);
}

export function invalidatePattern(pattern: string) {
    for (const key of global._memCache.keys()) {
        if (key.startsWith(pattern)) global._memCache.delete(key);
    }
}
