import { afterEach, describe, expect, it } from 'vitest'

import { loadEnv, resetEnv } from './env'

const testSecret = 'test-secret-test-secret'

afterEach(() => {
  resetEnv()
})

describe('loadEnv devBenchEnabled', () => {
  it('defaults on outside production', () => {
    expect(loadEnv({ NODE_ENV: 'development', JWT_SECRET: testSecret }).devBenchEnabled).toBe(true)
    expect(loadEnv({ NODE_ENV: 'test', JWT_SECRET: testSecret }).devBenchEnabled).toBe(true)
  })

  it('defaults off in production', () => {
    expect(loadEnv({ NODE_ENV: 'production', JWT_SECRET: testSecret }).devBenchEnabled).toBe(false)
  })

  it('honors DEV_BENCH_ENABLED=true in production', () => {
    expect(
      loadEnv({
        NODE_ENV: 'production',
        JWT_SECRET: testSecret,
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
