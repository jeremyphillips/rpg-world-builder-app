import type { Server as HttpServer } from 'node:http'

import { Server } from 'socket.io'

import { authenticateSocket } from './auth'
import { registerRealtimeServer } from './delivery'
import { userRoom } from './rooms'

const SOCKET_IO_PATH = '/api/socket.io'

/**
 * Attaches Socket.IO to the API HTTP server.
 *
 * Uses the default in-memory adapter — room fanout is limited to a single API
 * process. Horizontal scale requires a shared adapter (for example Redis) before
 * running multiple instances; sticky sessions alone are insufficient.
 */
export function attachRealtimeServer(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    path: SOCKET_IO_PATH,
  })

  io.use(async (socket, next) => {
    try {
      const auth = await authenticateSocket(socket)
      if (!auth) {
        next(new Error('Unauthorized'))
        return
      }

      socket.data.userId = auth.userId
      await socket.join(userRoom(auth.userId))
      next()
    } catch (error) {
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

export { SOCKET_IO_PATH }
