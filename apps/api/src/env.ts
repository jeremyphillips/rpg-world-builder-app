import { z } from 'zod'

import type { MongoTransactionMode } from './lib/mongo-transaction'

/**
 * Validated runtime configuration. Parsed once at startup so a misconfigured
 * environment fails fast with a clear message rather than at first request.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5001),
  MONGODB_URI: z.string().min(1).default('mongodb://127.0.0.1:27017/rpg'),
  /** Mongo multi-document transaction mode. Resolved once at startup after connect. */
  MONGO_TRANSACTION_MODE: z.enum(['auto', 'required', 'disabled']).default('auto'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  /** Directory where uploaded files are stored (relative to the API process CWD). */
  UPLOAD_DIR: z.string().min(1).default('./uploads'),
  /** Maximum allowed upload size in bytes. */
  MAX_UPLOAD_BYTES: z.coerce.number().int().positive().default(5_242_880),
  /** Mount unauthenticated `/api/bench` routes. Defaults off in production. */
  DEV_BENCH_ENABLED: z.enum(['true', 'false']).optional(),
  /** Mount `/api/character-import` routes. Defaults off in production. */
  CHARACTER_IMPORT_ENABLED: z.enum(['true', 'false']).optional(),
  /** Outbound D&D Beyond character fetch timeout in milliseconds. */
  DND_BEYOND_FETCH_TIMEOUT_MS: z.coerce.number().int().positive().default(10_000),
  /** Email transport selection. Defaults by NODE_ENV when unset. */
  EMAIL_PROVIDER: z.enum(['ethereal', 'smtp', 'fake']).optional(),
  /** Public app base URL for invite links (dev proxy origin). */
  APP_BASE_URL: z.string().url().default('http://localhost:8080'),
  SMTP_HOST: z.string().min(1).optional(),
  SMTP_PORT: z.coerce.number().int().positive().optional(),
  SMTP_USER: z.string().min(1).optional(),
  SMTP_PASS: z.string().min(1).optional(),
  SMTP_FROM_ADDRESS: z.string().email().optional(),
  /** Optional Redis URL for Socket.IO multi-instance fanout (`@socket.io/redis-adapter`). */
  REDIS_URL: z.string().url().optional(),
})

export type EmailProviderName = 'ethereal' | 'smtp' | 'fake'

export type Env = z.infer<typeof envSchema> & {
  isProduction: boolean
  devBenchEnabled: boolean
  characterImportEnabled: boolean
  dndBeyondFetchTimeoutMs: number
  emailProvider: EmailProviderName
  mongoTransactionMode: MongoTransactionMode
  appBaseUrl: string
  smtpHost: string
  smtpPort: number
  smtpUser: string
  smtpPass: string
  smtpFromAddress: string
  redisUrl?: string
}

function resolveDevBenchEnabled(
  nodeEnv: z.infer<typeof envSchema>['NODE_ENV'],
  raw: z.infer<typeof envSchema>['DEV_BENCH_ENABLED'],
): boolean {
  if (raw === 'true') return true
  if (raw === 'false') return false
  return nodeEnv !== 'production'
}

function resolveCharacterImportEnabled(
  nodeEnv: z.infer<typeof envSchema>['NODE_ENV'],
  raw: z.infer<typeof envSchema>['CHARACTER_IMPORT_ENABLED'],
): boolean {
  if (raw === 'true') return true
  if (raw === 'false') return false
  return nodeEnv !== 'production'
}

function resolveEmailProvider(
  nodeEnv: z.infer<typeof envSchema>['NODE_ENV'],
  raw: z.infer<typeof envSchema>['EMAIL_PROVIDER'],
): EmailProviderName {
  if (raw) return raw
  if (nodeEnv === 'test') return 'fake'
  if (nodeEnv === 'production') return 'smtp'
  return 'ethereal'
}

function resolveSmtpFromAddress(
  nodeEnv: z.infer<typeof envSchema>['NODE_ENV'],
  raw: z.infer<typeof envSchema>['SMTP_FROM_ADDRESS'],
): string {
  if (raw) return raw
  if (nodeEnv === 'production') {
    throw new Error(
      'Invalid environment configuration:\n  - SMTP_FROM_ADDRESS: Required in production',
    )
  }
  return 'no-reply@localhost'
}

const SMTP_REQUIRED_FIELDS = [
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS',
  'SMTP_FROM_ADDRESS',
] as const

function defaultSmtpConfig(
  parsed: z.infer<typeof envSchema>,
  smtpFromAddress: string,
): Pick<Env, 'smtpHost' | 'smtpPort' | 'smtpUser' | 'smtpPass' | 'smtpFromAddress'> {
  return {
    smtpHost: parsed.SMTP_HOST ?? 'localhost',
    smtpPort: parsed.SMTP_PORT ?? 587,
    smtpUser: parsed.SMTP_USER ?? '',
    smtpPass: parsed.SMTP_PASS ?? '',
    smtpFromAddress,
  }
}

function requireSmtpConfig(
  parsed: z.infer<typeof envSchema>,
  smtpFromAddress: string,
): Pick<Env, 'smtpHost' | 'smtpPort' | 'smtpUser' | 'smtpPass' | 'smtpFromAddress'> {
  const missing = SMTP_REQUIRED_FIELDS.filter((field) => !parsed[field])
  if (missing.length > 0) {
    throw new Error(
      `Invalid environment configuration:\n${missing.map((key) => `  - ${key}: Required when EMAIL_PROVIDER is smtp`).join('\n')}`,
    )
  }

  return {
    smtpHost: parsed.SMTP_HOST!,
    smtpPort: parsed.SMTP_PORT!,
    smtpUser: parsed.SMTP_USER!,
    smtpPass: parsed.SMTP_PASS!,
    smtpFromAddress,
  }
}

function resolveSmtpConfig(
  emailProvider: EmailProviderName,
  parsed: z.infer<typeof envSchema>,
): Pick<Env, 'smtpHost' | 'smtpPort' | 'smtpUser' | 'smtpPass' | 'smtpFromAddress'> {
  const smtpFromAddress = resolveSmtpFromAddress(parsed.NODE_ENV, parsed.SMTP_FROM_ADDRESS)
  return emailProvider === 'smtp'
    ? requireSmtpConfig(parsed, smtpFromAddress)
    : defaultSmtpConfig(parsed, smtpFromAddress)
}

let cached: Env | undefined

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  if (cached) return cached

  const parsed = envSchema.safeParse({
    NODE_ENV: source.NODE_ENV,
    PORT: source.PORT,
    MONGODB_URI: source.MONGODB_URI,
    MONGO_TRANSACTION_MODE: source.MONGO_TRANSACTION_MODE,
    // Tests never hit production paths, so allow a dev fallback secret outside prod.
    JWT_SECRET:
      source.JWT_SECRET ??
      (source.NODE_ENV === 'production' ? undefined : 'dev-insecure-secret-change-me'),
    JWT_EXPIRES_IN: source.JWT_EXPIRES_IN,
    UPLOAD_DIR: source.UPLOAD_DIR,
    MAX_UPLOAD_BYTES: source.MAX_UPLOAD_BYTES,
    DEV_BENCH_ENABLED: source.DEV_BENCH_ENABLED,
    CHARACTER_IMPORT_ENABLED: source.CHARACTER_IMPORT_ENABLED,
    DND_BEYOND_FETCH_TIMEOUT_MS: source.DND_BEYOND_FETCH_TIMEOUT_MS,
    EMAIL_PROVIDER: source.EMAIL_PROVIDER,
    APP_BASE_URL: source.APP_BASE_URL,
    SMTP_HOST: source.SMTP_HOST,
    SMTP_PORT: source.SMTP_PORT,
    SMTP_USER: source.SMTP_USER,
    SMTP_PASS: source.SMTP_PASS,
    SMTP_FROM_ADDRESS: source.SMTP_FROM_ADDRESS,
    REDIS_URL: source.REDIS_URL,
  })

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
      .join('\n')
    throw new Error(`Invalid environment configuration:\n${issues}`)
  }

  const emailProvider = resolveEmailProvider(parsed.data.NODE_ENV, parsed.data.EMAIL_PROVIDER)
  const smtpConfig = resolveSmtpConfig(emailProvider, parsed.data)

  cached = {
    ...parsed.data,
    isProduction: parsed.data.NODE_ENV === 'production',
    devBenchEnabled: resolveDevBenchEnabled(parsed.data.NODE_ENV, parsed.data.DEV_BENCH_ENABLED),
    characterImportEnabled: resolveCharacterImportEnabled(
      parsed.data.NODE_ENV,
      parsed.data.CHARACTER_IMPORT_ENABLED,
    ),
    dndBeyondFetchTimeoutMs: parsed.data.DND_BEYOND_FETCH_TIMEOUT_MS,
    emailProvider,
    mongoTransactionMode: parsed.data.MONGO_TRANSACTION_MODE,
    appBaseUrl: parsed.data.APP_BASE_URL,
    redisUrl: parsed.data.REDIS_URL,
    ...smtpConfig,
  }
  return cached
}

/** Reset memoized env (used by tests that mutate process.env). */
export function resetEnv() {
  cached = undefined
}
