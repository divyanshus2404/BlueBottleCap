type RateResult = { allowed: boolean; remaining: number; reset: number };

let memoryStore: Map<string, { count: number; expiresAt: number }> | null = null;

export async function rateLimit(key: string, limit = 100, windowMs = 60_000): Promise<RateResult> {
  // If REDIS_URL is provided, attempt to use it; otherwise fall back to memory
  const redisUrl = process.env.REDIS_URL;
  const now = Date.now();

  if (redisUrl) {
    try {
      // Dynamically import to avoid hard dependency in environments without ioredis
      const redisModule = await import('ioredis');
      const Redis = (redisModule as any).default ?? redisModule;
      const client = new Redis(redisUrl);
      const keyName = `ratelimit:${key}`;
      const ttl = Math.ceil(windowMs / 1000);
      const current = await client.incr(keyName);
      if (current === 1) {
        await client.expire(keyName, ttl);
      }
      const remaining = Math.max(0, limit - current);
      const ttlLeft = await client.ttl(keyName);
      await client.quit();
      return { allowed: current <= limit, remaining, reset: Date.now() + ttlLeft * 1000 };
    } catch (err) {
      // If Redis isn't available, fall through to memory fallback
      console.warn('Redis rate limit failed, using in-memory fallback', err);
    }
  }

  // In-memory fallback
  if (!memoryStore) memoryStore = new Map();
  const rec = memoryStore.get(key) ?? { count: 0, expiresAt: now + windowMs };
  if (rec.expiresAt <= now) {
    rec.count = 0;
    rec.expiresAt = now + windowMs;
  }
  rec.count += 1;
  memoryStore.set(key, rec);
  return { allowed: rec.count <= limit, remaining: Math.max(0, limit - rec.count), reset: rec.expiresAt };
}
