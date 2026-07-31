import { createServer } from 'node:http'

import { createApp } from './app'
import { loadEnv } from './env'
import { connectDb, disconnectDb } from './lib/db'
import { attachRealtimeServer } from './realtime'

async function main(): Promise<void> {
  const env = loadEnv()
  await connectDb(env.MONGODB_URI)

  const app = createApp()
  const httpServer = createServer(app)
  attachRealtimeServer(httpServer)

  httpServer.listen(env.PORT, () => {
    console.log(`[api] listening on http://localhost:${env.PORT} (mounted at /api)`)
  })

  const shutdown = (signal: string) => {
    console.log(`[api] ${signal} received, shutting down`)
    httpServer.close(() => {
      void disconnectDb().finally(() => process.exit(0))
    })
  }

  process.on('SIGINT', () => shutdown('SIGINT'))
  process.on('SIGTERM', () => shutdown('SIGTERM'))
}

main().catch((err) => {
  console.error('[api] failed to start:', err)
  process.exit(1)
})
