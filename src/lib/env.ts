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
  
  // Cloudinary (optional for MVP)
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  CLOUDINARY_UPLOAD_PRESET: z.string().optional(),
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
