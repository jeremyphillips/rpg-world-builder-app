import { afterEach, describe, expect, it } from 'vitest'

import { integrationMongoUriForWorker } from './integration-mongo-uri'

describe('integrationMongoUriForWorker', () => {
  const previousWorkerId = process.env.VITEST_WORKER_ID

  afterEach(() => {
    if (previousWorkerId === undefined) {
      delete process.env.VITEST_WORKER_ID
    } else {
      process.env.VITEST_WORKER_ID = previousWorkerId
    }
  })

  it('appends worker db before query string', () => {
    process.env.VITEST_WORKER_ID = '3'
    expect(integrationMongoUriForWorker('mongodb://127.0.0.1:51234/?replicaSet=testset')).toBe(
      'mongodb://127.0.0.1:51234/vitest_w3?replicaSet=testset',
    )
  })

  it('defaults to worker 0 when env is unset', () => {
    delete process.env.VITEST_WORKER_ID
    expect(integrationMongoUriForWorker('mongodb://127.0.0.1:51234')).toBe(
      'mongodb://127.0.0.1:51234/vitest_w0',
    )
  })
})
