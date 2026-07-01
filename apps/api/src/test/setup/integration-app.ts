import { beforeAll } from 'vitest'
import type { Express } from 'express'

import { createApp } from '../../app'
import { useIntegrationDb } from './integration-db'

/** Registers DB + Express app lifecycle hooks; returns a getter for the shared app instance. */
export function useIntegrationApp(): () => Express {
  useIntegrationDb()

  let app: Express

  beforeAll(() => {
    app = createApp()
  })

  return () => app
}
