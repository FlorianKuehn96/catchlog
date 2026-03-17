import { Redis } from '@upstash/redis';

let redisInstance: Redis | null = null;

export function getRedis(): Redis {
  if (!redisInstance) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    
    if (!url || !token) {
      throw new Error('Redis config missing: UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set');
    }
    
    redisInstance = new Redis({ url, token });
  }
  return redisInstance;
}

// Lazy getter - use this instead of direct import
export function getRedisClient(): Redis {
  return getRedis();
}

// Helper to handle Upstash's automatic parsing
export function parseRedisData<T>(data: unknown): T | null {
  if (data === null || data === undefined) return null;
  return data as T;
}

// Keys - ALL prefixed with 'catchlog:' to avoid conflicts with other projects
export const keys = {
  user: (id: string) => `catchlog:user:${id}`,
  spot: (id: string) => `catchlog:spot:${id}`,
  spotsByUser: (userId: string) => `catchlog:spots:${userId}`,
  catch: (id: string) => `catchlog:catch:${id}`,
  catchesByUser: (userId: string) => `catchlog:catches:${userId}`,
  catchesBySpot: (spotId: string) => `catchlog:catches:spot:${spotId}`,
  bait: (id: string) => `catchlog:bait:${id}`,
  baits: () => 'catchlog:baits:all',
};

// Legacy export for backwards compatibility - DO NOT USE in new code
// This will be removed once all imports are migrated
export const redis = new Proxy({} as Redis, {
  get(target, prop) {
    const client = getRedis();
    return (client as any)[prop];
  },
});
