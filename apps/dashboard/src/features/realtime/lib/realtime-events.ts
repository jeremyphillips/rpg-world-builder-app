/** Stable Socket.IO event names — must match `apps/api/src/realtime/events.ts`. */
export const REALTIME_EVENTS = {
  notificationUpserted: 'notification.upserted',
  notificationRead: 'notification.read',
  conversationActivity: 'conversation.activity',
} as const

export const SOCKET_IO_PATH = '/api/socket.io'
