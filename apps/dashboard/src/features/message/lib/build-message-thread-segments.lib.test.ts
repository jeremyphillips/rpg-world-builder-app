import { describe, expect, it } from 'vitest'

import { makeDirectMessage } from '@/test/fixtures/messages'

import { buildMessageThreadSegments } from './build-message-thread-segments.lib'

describe('buildMessageThreadSegments', () => {
  it('inserts a date separator before the first group of each calendar day', () => {
    const segments = buildMessageThreadSegments([
      makeDirectMessage({
        id: 'm1',
        createdAt: '2026-07-29T12:00:00.000Z',
      }),
      makeDirectMessage({
        id: 'm2',
        senderUserId: 'user-1',
        createdAt: '2026-07-30T12:00:00.000Z',
      }),
    ])

    expect(segments).toHaveLength(4)
    expect(segments[0]).toEqual({
      type: 'date-separator',
      timestamp: '2026-07-29T12:00:00.000Z',
    })
    expect(segments[1]).toEqual({
      type: 'message-group',
      group: expect.objectContaining({
        messages: [expect.objectContaining({ id: 'm1' })],
      }),
    })
    expect(segments[2]).toEqual({
      type: 'date-separator',
      timestamp: '2026-07-30T12:00:00.000Z',
    })
    expect(segments[3]).toEqual({
      type: 'message-group',
      group: expect.objectContaining({
        messages: [expect.objectContaining({ id: 'm2' })],
      }),
    })
  })

  it('does not insert separators between groups on the same day', () => {
    const segments = buildMessageThreadSegments([
      makeDirectMessage({
        id: 'm1',
        senderUserId: 'user-2',
        createdAt: '2026-07-30T12:00:00.000Z',
      }),
      makeDirectMessage({
        id: 'm2',
        senderUserId: 'user-1',
        createdAt: '2026-07-30T12:01:00.000Z',
      }),
    ])

    expect(segments).toHaveLength(3)
    expect(segments.filter((segment) => segment.type === 'date-separator')).toHaveLength(1)
    expect(segments.filter((segment) => segment.type === 'message-group')).toHaveLength(2)
  })
})
