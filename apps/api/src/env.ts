import { z } from 'zod'

/**
 * Validated runtime configuration. Parsed once at startup so a misconfigured
 * environment fails fast with a clear message rather than at first request.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5001),
  MONGODB_URI: z.string().min(1).default('mongodb://127.0.0.1:27017/rpg'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  /** Directory where uploaded files are stored (relative to the API process CWD). */
  UPLOAD_DIR: z.string().min(1).default('./uploads'),
  /** Maximum allowed upload size in bytes. */
  MAX_UPLOAD_BYTES: z.coerce.number().int().positive().default(5_242_880),
})

export type Env = z.infer<typeof envSchema> & { isProduction: boolean }

let cached: Env | undefined

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  if (cached) return cached

  const parsed = envSchema.safeParse({
    NODE_ENV: source.NODE_ENV,
    PORT: source.PORT,
    MONGODB_URI: source.MONGODB_URI,
    // Tests never hit production paths, so allow a dev fallback secret outside prod.
    JWT_SECRET:
      source.JWT_SECRET ??
      (source.NODE_ENV === 'production' ? undefined : 'dev-insecure-secret-change-me'),
    JWT_EXPIRES_IN: source.JWT_EXPIRES_IN,
    UPLOAD_DIR: source.UPLOAD_DIR,
    MAX_UPLOAD_BYTES: source.MAX_UPLOAD_BYTES,
  })

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
      .join('\n')
    throw new Error(`Invalid environment configuration:\n${issues}`)
  }

  cached = { ...parsed.data, isProduction: parsed.data.NODE_ENV === 'production' }
  return cached
}

/** Reset memoized env (used by tests that mutate process.env). */
export function resetEnv() {
  cached = undefined
}
