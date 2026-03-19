// Rate Limiting for CatchLog API
// Uses Redis for distributed rate limiting

import { getRedis } from './redis';

interface RateLimitConfig {
  requests: number;  // Max requests
  window: number;    // Time window in seconds
}

// Rate limit configs by endpoint
export const RATE_LIMITS: Record<string, RateLimitConfig> = {
  // Strict limits for write operations
  'POST:/api/catches': { requests: 10, window: 60 },      // 10 catches per minute
  'PUT:/api/catches': { requests: 20, window: 60 },       // 20 updates per minute
  'DELETE:/api/catches': { requests: 10, window: 60 },   // 10 deletes per minute
  'POST:/api/spots': { requests: 10, window: 60 },       // 10 spots per minute
  
  // Medium limits for uploads
  'GET:/api/upload-signature': { requests: 20, window: 60 }, // 20 uploads per minute
  
  // Lenient limits for reads
  'GET:/api/catches': { requests: 100, window: 60 },    // 100 reads per minute
  'GET:/api/spots': { requests: 100, window: 60 },
  'GET:/api/stats': { requests: 30, window: 60 },
  'GET:/api/export/csv': { requests: 5, window: 60 },     // 5 exports per minute
};

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
}

export async function checkRateLimit(
  identifier: string,  // userId or IP
  endpoint: string
): Promise<RateLimitResult> {
  const config = RATE_LIMITS[endpoint];
  if (!config) {
    // No rate limit for this endpoint
    return { allowed: true, remaining: 100, resetTime: Date.now() + 60000 };
  }

  const redis = getRedis();
  const key = `ratelimit:${endpoint}:${identifier}`;
  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - config.window;

  try {
    // Get current count
    const count = await redis.get(key);
    const currentCount = count ? parseInt(count as string, 10) : 0;

    if (currentCount >= config.requests) {
      // Rate limit exceeded
      const ttl = await redis.ttl(key);
      return {
        allowed: false,
        remaining: 0,
        resetTime: Date.now() + (ttl * 1000),
      };
    }

    // Increment counter
    const pipeline = redis.pipeline();
    pipeline.incr(key);
    pipeline.expire(key, config.window);
    await pipeline.exec();

    return {
      allowed: true,
      remaining: config.requests - currentCount - 1,
      resetTime: Date.now() + (config.window * 1000),
    };
  } catch (error) {
    console.error('Rate limit check failed:', error);
    // Allow on error (fail open)
    return { allowed: true, remaining: 1, resetTime: Date.now() + 60000 };
  }
}

// Helper to get client IP from request
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return 'unknown';
}
