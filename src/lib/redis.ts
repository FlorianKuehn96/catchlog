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

// Keys
export const keys = {
  user: (id: string) => `user:${id}`,
  spot: (id: string) => `spot:${id}`,
  spotsByUser: (userId: string) => `spots:${userId}`,
  catch: (id: string) => `catch:${id}`,
  catchesByUser: (userId: string) => `catches:${userId}`,
  catchesBySpot: (spotId: string) => `catches:spot:${spotId}`,
  bait: (id: string) => `bait:${id}`,
  baits: () => 'baits:all',
};

// Legacy export for backwards compatibility - DO NOT USE in new code
// This will be removed once all imports are migrated
export const redis = new Proxy({} as Redis, {
  get(target, prop) {
    const client = getRedis();
    return (client as any)[prop];
  },
});
