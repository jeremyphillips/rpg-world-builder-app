import { createAdapter } from '@socket.io/redis-adapter'
import { createClient, type RedisClientType } from 'redis'
import type { Server } from 'socket.io'

import { loadEnv } from '../env'
import { logRealtimeAdapterInfo } from './logging'

let pubClient: RedisClientType | null = null
let subClient: RedisClientType | null = null

/**
 * Configures a shared Socket.IO adapter when `REDIS_URL` is set.
 * Without Redis, the default in-memory adapter serves a single API process only.
 */
export async function configureSocketIoAdapter(io: Server): Promise<void> {
  const { redisUrl } = loadEnv()
  if (!redisUrl) {
    logRealtimeAdapterInfo(
      'using in-memory adapter (single API instance; set REDIS_URL for horizontal scale)',
    )
    return
  }

  pubClient = createClient({ url: redisUrl })
  subClient = pubClient.duplicate()

  pubClient.on('error', (error) => {
    console.error('[realtime] redis pub client error:', error)
  })
  subClient.on('error', (error) => {
    console.error('[realtime] redis sub client error:', error)
  })

  await Promise.all([pubClient.connect(), subClient.connect()])
  io.adapter(createAdapter(pubClient, subClient))
  logRealtimeAdapterInfo('Redis adapter enabled for multi-instance fanout')
}

export async function closeSocketIoAdapter(): Promise<void> {
  await Promise.all([
    pubClient?.quit().catch(() => undefined),
    subClient?.quit().catch(() => undefined),
  ])
  pubClient = null
  subClient = null
}

/** Test-only reset for module-level Redis clients. */
export function resetSocketIoAdapterForTests(): void {
  pubClient = null
  subClient = null
}
