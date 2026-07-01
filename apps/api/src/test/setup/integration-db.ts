import { afterAll, beforeAll, beforeEach } from 'vitest'

import { clearTestDb, startTestDb, stopTestDb } from '../db'

/** Registers in-memory Mongo lifecycle hooks for integration tests. */
export function useIntegrationDb(): void {
  beforeAll(async () => {
    await startTestDb()
  })

  beforeEach(async () => {
    await clearTestDb()
  })

  afterAll(async () => {
    await stopTestDb()
  })
}
