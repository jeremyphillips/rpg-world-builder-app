import { afterEach, describe, expect, it } from 'vitest'

import { loadEnv, resetEnv } from './env'

const testSecret = 'test-secret-test-secret'

const productionSmtpEnv = {
  NODE_ENV: 'production' as const,
  JWT_SECRET: testSecret,
  SMTP_HOST: 'smtp.example.com',
  SMTP_PORT: '587',
  SMTP_USER: 'user',
  SMTP_PASS: 'pass',
  SMTP_FROM_ADDRESS: 'no-reply@example.com',
}

afterEach(() => {
  resetEnv()
})

describe('loadEnv devBenchEnabled', () => {
  it('defaults on outside production', () => {
    expect(loadEnv({ NODE_ENV: 'development', JWT_SECRET: testSecret }).devBenchEnabled).toBe(true)
    expect(loadEnv({ NODE_ENV: 'test', JWT_SECRET: testSecret }).devBenchEnabled).toBe(true)
  })

  it('defaults off in production', () => {
    expect(loadEnv(productionSmtpEnv).devBenchEnabled).toBe(false)
  })

  it('honors DEV_BENCH_ENABLED=true in production', () => {
    expect(
      loadEnv({
        ...productionSmtpEnv,
        DEV_BENCH_ENABLED: 'true',
      }).devBenchEnabled,
    ).toBe(true)
  })

  it('honors DEV_BENCH_ENABLED=false in development', () => {
    expect(
      loadEnv({
        NODE_ENV: 'development',
        JWT_SECRET: testSecret,
        DEV_BENCH_ENABLED: 'false',
      }).devBenchEnabled,
    ).toBe(false)
  })
})

describe('loadEnv mongoTransactionMode', () => {
  it('defaults to auto', () => {
    expect(loadEnv({ NODE_ENV: 'test', JWT_SECRET: testSecret }).mongoTransactionMode).toBe('auto')
  })

  it('honors MONGO_TRANSACTION_MODE override', () => {
    expect(
      loadEnv({
        NODE_ENV: 'test',
        JWT_SECRET: testSecret,
        MONGO_TRANSACTION_MODE: 'disabled',
      }).mongoTransactionMode,
    ).toBe('disabled')
  })
})

describe('loadEnv emailProvider', () => {
  it('defaults by environment', () => {
    resetEnv()
    expect(loadEnv({ NODE_ENV: 'test', JWT_SECRET: testSecret }).emailProvider).toBe('fake')

    resetEnv()
    expect(loadEnv({ NODE_ENV: 'development', JWT_SECRET: testSecret }).emailProvider).toBe(
      'ethereal',
    )

    resetEnv()
    expect(loadEnv(productionSmtpEnv).emailProvider).toBe('smtp')
  })

  it('honors EMAIL_PROVIDER override', () => {
    expect(
      loadEnv({
        ...productionSmtpEnv,
        EMAIL_PROVIDER: 'fake',
      }).emailProvider,
    ).toBe('fake')
  })
})
