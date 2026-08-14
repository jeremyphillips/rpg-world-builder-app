import { describe, expect, it, vi } from 'vitest'

import {
  areMongoTransactionsEnabled,
  detectMongoTransactionSupport,
  resolveMongoTransactionCapability,
  runInTransaction,
  setMongoTransactionsEnabled,
} from './mongo-transaction'
import { useIntegrationDb } from '../test/setup/integration-db'

useIntegrationDb()

describe('mongo-transaction', () => {
  it('detects transaction support on a replica-set test harness', async () => {
    expect(await detectMongoTransactionSupport()).toBe(true)
    expect(areMongoTransactionsEnabled()).toBe(true)
  })

  it('resolveMongoTransactionCapability honors disabled mode', async () => {
    expect(await resolveMongoTransactionCapability('disabled')).toBe(false)
  })

  it('rejects before invoking the transaction callback when transactions are disabled', async () => {
    const callback = vi.fn()
    setMongoTransactionsEnabled(false)

    try {
      await expect(runInTransaction(callback)).rejects.toThrow(
        'MongoDB transactions are not enabled for this process.',
      )
      expect(callback).not.toHaveBeenCalled()
    } finally {
      setMongoTransactionsEnabled(true)
    }
  })

  it('runs the callback inside a replica-set transaction when transactions are enabled', async () => {
    const result = await runInTransaction(async (session) => {
      expect(session.inTransaction()).toBe(true)
      return 'committed'
    })

    expect(result).toBe('committed')
  })

  it('propagates callback failures instead of degrading to another write path', async () => {
    const failure = new Error('transaction callback failed')
    const callback = vi.fn(async () => {
      throw failure
    })

    await expect(runInTransaction(callback)).rejects.toBe(failure)
    expect(callback).toHaveBeenCalledOnce()
  })
})
