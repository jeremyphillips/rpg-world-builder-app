import { beforeAll, inject } from 'vitest'

import { resetEnv } from '../../env'
import { connectDb } from '../../lib/db'

import { integrationMongoUriForWorker } from './integration-mongo-uri'

let connected = false

beforeAll(async () => {
  if (connected) return

  const uri = integrationMongoUriForWorker(inject('mongoUri'))

  process.env.NODE_ENV = 'test'
  process.env.JWT_SECRET = 'test-secret-test-secret-1234567890'
  process.env.MONGODB_URI = uri
  resetEnv()
  await connectDb(uri)
  connected = true
})
