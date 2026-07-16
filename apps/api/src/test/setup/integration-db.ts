import { beforeEach } from 'vitest'

import { clearTestDb } from '../db'

/** Registers per-test DB clearing for integration suites (Mongo is started in globalSetup). */
export function useIntegrationDb(): void {
  beforeEach(async () => {
    await clearTestDb()
  })
}
