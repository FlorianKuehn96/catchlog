import { z } from 'zod';

const envSchema = z.object({
  // Upstash Redis
  UPSTASH_REDIS_REST_URL: z.string().url('UPSTASH_REDIS_REST_URL must be a valid URL'),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1, 'UPSTASH_REDIS_REST_TOKEN is required'),
  
  // NextAuth
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL'),
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET should be at least 32 characters'),
  
  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID is required'),
  GOOGLE_CLIENT_SECRET: z.string().min(1, 'GOOGLE_CLIENT_SECRET is required'),
  
  // Stripe
  STRIPE_SECRET_KEY: z.string().startsWith('sk_', 'STRIPE_SECRET_KEY must start with sk_'),
  STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_', 'STRIPE_PUBLISHABLE_KEY must start with pk_'),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_', 'STRIPE_WEBHOOK_SECRET must start with whsec_'),
  STRIPE_PRICE_ID: z.string().startsWith('price_', 'STRIPE_PRICE_ID must start with price_'),
  
  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().min(1, 'CLOUDINARY_CLOUD_NAME is required'),
  CLOUDINARY_API_KEY: z.string().min(1, 'CLOUDINARY_API_KEY is required'),
  CLOUDINARY_API_SECRET: z.string().min(1, 'CLOUDINARY_API_SECRET is required'),
});

// Validate on server only
let validatedEnv: z.infer<typeof envSchema> | null = null;

export function validateEnv(): z.infer<typeof envSchema> {
  if (validatedEnv) return validatedEnv;
  
  if (typeof window !== 'undefined') {
    throw new Error('validateEnv should only be called on the server');
  }
  
  const result = envSchema.safeParse(process.env);
  
  if (!result.success) {
    const errors = result.error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join('\n');
    console.error('Environment validation failed:\n', errors);
    throw new Error(`Environment validation failed:\n${errors}`);
  }
  
  validatedEnv = result.data;
  return validatedEnv;
}

// Safe getter for individual env vars
export function getEnv(key: keyof z.infer<typeof envSchema>): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value;
}

// Check if running in production
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

// Check if all required env vars are present (for build-time checks)
export function hasRequiredEnv(): boolean {
  try {
    const required = [
      'UPSTASH_REDIS_REST_URL',
      'UPSTASH_REDIS_REST_TOKEN',
      'NEXTAUTH_SECRET',
    ];
    return required.every(key => !!process.env[key]);
  } catch {
    return false;
  }
}
