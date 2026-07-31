import { describe, expect, it } from 'vitest'

import { REALTIME_EVENTS, SOCKET_IO_PATH } from './realtime'

describe('realtime transport constants', () => {
  it('exposes stable Socket.IO event names', () => {
    expect(REALTIME_EVENTS.notificationUpserted).toBe('notification.upserted')
    expect(REALTIME_EVENTS.notificationRead).toBe('notification.read')
    expect(REALTIME_EVENTS.conversationActivity).toBe('conversation.activity')
  })

  it('uses the API mount path for Socket.IO', () => {
    expect(SOCKET_IO_PATH).toBe('/api/socket.io')
  })
})
