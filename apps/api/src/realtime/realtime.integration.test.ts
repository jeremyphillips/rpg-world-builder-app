import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { io as createClient, type Socket } from 'socket.io-client'

import { publishNotification } from '../features/notification/publish-notification.service'
import { registerAndLoginTestUser } from '../test/auth-agent'
import { clearTestDb } from '../test/db'
import { useIntegrationDb } from '../test/setup/integration-db'
import {
  closeIntegrationHttpServer,
  createIntegrationHttpServer,
  type IntegrationHttpServer,
} from '../test/setup/integration-http-server'
import { buildSessionCookieHeader } from '../test/session-cookie'
import { REALTIME_EVENTS } from './events'
import { SOCKET_IO_PATH } from './socket-server'
import { deliverToUser, resetRealtimeServerForTests } from './delivery'

useIntegrationDb()

function waitForSocketEvent<T>(socket: Socket, event: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`Timed out waiting for ${event}`))
    }, 5_000)

    socket.once(event, (payload: T) => {
      clearTimeout(timeout)
      resolve(payload)
    })
  })
}

function connectSocket(baseUrl: string, cookieHeader: string): Promise<Socket> {
  const socket = createClient(baseUrl, {
    path: SOCKET_IO_PATH,
    transports: ['polling', 'websocket'],
    transportOptions: {
      polling: { extraHeaders: { Cookie: cookieHeader } },
      websocket: { extraHeaders: { Cookie: cookieHeader } },
    },
  })

  return new Promise((resolve, reject) => {
    socket.on('connect', () => resolve(socket))
    socket.on('connect_error', reject)
  })
}

describe('realtime delivery boundary', () => {
  it('does not emit when Socket.IO is not registered', () => {
    resetRealtimeServerForTests()
    expect(() =>
      deliverToUser('user-1', REALTIME_EVENTS.notificationUpserted, { hello: 'world' }),
    ).not.toThrow()
  })
})

describe('realtime socket server', () => {
  let serverBundle: IntegrationHttpServer

  beforeAll(async () => {
    serverBundle = await createIntegrationHttpServer()
  })

  afterAll(async () => {
    resetRealtimeServerForTests()
    await closeIntegrationHttpServer(serverBundle.httpServer)
  })

  it('rejects unauthenticated socket handshakes', async () => {
    await clearTestDb()

    const socket = createClient(serverBundle.baseUrl, {
      path: SOCKET_IO_PATH,
      transports: ['websocket'],
      autoConnect: false,
    })

    await expect(
      new Promise<void>((resolve, reject) => {
        socket.on('connect', () => reject(new Error('Expected unauthenticated connect to fail')))
        socket.on('connect_error', () => resolve())
        socket.connect()
      }),
    ).resolves.toBeUndefined()

    socket.disconnect()
  })

  it('joins user rooms after cookie auth and isolates delivery', async () => {
    await clearTestDb()

    const recipient = await registerAndLoginTestUser(serverBundle.app, {
      email: 'socket-recipient@example.com',
      password: 'supersecret',
      displayName: 'Socket Recipient',
    })
    const other = await registerAndLoginTestUser(serverBundle.app, {
      email: 'socket-other@example.com',
      password: 'supersecret',
      displayName: 'Socket Other',
    })

    const recipientSocket = await connectSocket(
      serverBundle.baseUrl,
      buildSessionCookieHeader(recipient.userId),
    )
    const otherSocket = await connectSocket(
      serverBundle.baseUrl,
      buildSessionCookieHeader(other.userId),
    )

    const upsertPromise = waitForSocketEvent<{
      notification: { id: string }
      unreadCount: number
      version: number
    }>(recipientSocket, REALTIME_EVENTS.notificationUpserted)
    let otherReceived = false
    otherSocket.on(REALTIME_EVENTS.notificationUpserted, () => {
      otherReceived = true
    })

    const [notification] = await publishNotification({
      type: 'message.direct.received',
      recipientUserIds: [recipient.userId],
      payload: {
        conversationId: 'conversation-socket-1',
        messageId: 'message-socket-1',
        senderDisplayName: 'Ava',
        preview: 'Ping',
        unreadMessageCount: 1,
      },
    })
    expect(notification).toBeDefined()

    const payload = await upsertPromise
    expect(payload.notification.id).toBe(notification!.id)
    expect(payload.unreadCount).toBe(1)
    expect(payload.version).toBeGreaterThan(0)

    await new Promise((resolve) => setTimeout(resolve, 250))
    expect(otherReceived).toBe(false)

    recipientSocket.disconnect()
    otherSocket.disconnect()
  })

  it('delivers notification.read through the delivery boundary only', async () => {
    await clearTestDb()

    const recipient = await registerAndLoginTestUser(serverBundle.app, {
      email: 'socket-read@example.com',
      password: 'supersecret',
      displayName: 'Socket Read User',
    })

    const socket = await connectSocket(
      serverBundle.baseUrl,
      buildSessionCookieHeader(recipient.userId),
    )

    const readPromise = waitForSocketEvent<{
      notification: { id: string; readAt: string | null }
      unreadCount: number
    }>(socket, REALTIME_EVENTS.notificationRead)

    const [notification] = await publishNotification({
      type: 'message.direct.received',
      recipientUserIds: [recipient.userId],
      payload: {
        conversationId: 'conversation-read-1',
        messageId: 'message-read-1',
        senderDisplayName: 'Blake',
        preview: 'Read me',
        unreadMessageCount: 1,
      },
    })
    expect(notification).toBeDefined()

    await recipient.agent
      .patch(`/api/notifications/${notification!.id}/read`)
      .set('x-csrf-token', recipient.csrfToken)
      .expect(200)

    const readPayload = await readPromise
    expect(readPayload.notification.id).toBe(notification!.id)
    expect(readPayload.notification.readAt).toBeTruthy()
    expect(readPayload.unreadCount).toBe(0)

    socket.disconnect()
  })
})
