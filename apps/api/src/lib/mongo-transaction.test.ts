import { describe, expect, it } from 'vitest'

import {
  areMongoTransactionsEnabled,
  detectMongoTransactionSupport,
  resolveMongoTransactionCapability,
} from './mongo-transaction'

describe('mongo-transaction', () => {
  it('detects transaction support on a replica-set test harness', async () => {
    expect(await detectMongoTransactionSupport()).toBe(true)
    expect(areMongoTransactionsEnabled()).toBe(true)
  })

  it('resolveMongoTransactionCapability honors disabled mode', async () => {
    expect(await resolveMongoTransactionCapability('disabled')).toBe(false)
  })
})
