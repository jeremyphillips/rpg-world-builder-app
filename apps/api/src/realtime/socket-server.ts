import type { Server as HttpServer } from 'node:http'

import { Server } from 'socket.io'

import { SOCKET_IO_PATH } from '@rpg/contracts'

import { authenticateSocket } from './auth'
import { registerRealtimeServer } from './delivery'
import { logRealtimeAuthFailure } from './logging'
import { configureSocketIoAdapter } from './redis-adapter'
import { userRoom } from './rooms'

/**
 * Attaches Socket.IO to the API HTTP server.
 *
 * Uses the default in-memory adapter unless `REDIS_URL` is set — room fanout is
 * limited to a single API process without a shared adapter. Sticky sessions alone
 * are insufficient for multi-instance delivery.
 */
export async function attachRealtimeServer(httpServer: HttpServer): Promise<Server> {
  const io = new Server(httpServer, {
    path: SOCKET_IO_PATH,
  })

  await configureSocketIoAdapter(io)

  io.use(async (socket, next) => {
    try {
      const auth = await authenticateSocket(socket)
      if (!auth) {
        logRealtimeAuthFailure('missing or invalid session')
        next(new Error('Unauthorized'))
        return
      }

      socket.data.userId = auth.userId
      await socket.join(userRoom(auth.userId))
      next()
    } catch (error) {
      logRealtimeAuthFailure('handshake error', error)
      next(error instanceof Error ? error : new Error('Unauthorized'))
    }
  })

  io.on('connection', (socket) => {
    socket.on('error', () => {
      socket.disconnect(true)
    })
  })

  registerRealtimeServer(io)
  return io
}

export { SOCKET_IO_PATH } from '@rpg/contracts'
