import { beforeAll, inject } from 'vitest'

import { connectDb } from '../../lib/db'
import { resetEnv } from '../../env'

let connected = false

beforeAll(async () => {
  if (connected) return

  process.env.NODE_ENV = 'test'
  process.env.JWT_SECRET = 'test-secret-test-secret-1234567890'
  process.env.MONGODB_URI = inject('mongoUri')
  resetEnv()
  await connectDb(inject('mongoUri'))
  connected = true
})
