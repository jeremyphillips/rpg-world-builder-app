import { describe, expect, it } from 'vitest'

import { makeDirectMessage } from '@/test/fixtures/messages'

import { groupMessagesByTime } from './group-messages-by-time.lib'

describe('groupMessagesByTime', () => {
  it('groups consecutive same-sender messages within five minutes', () => {
    const groups = groupMessagesByTime([
      makeDirectMessage({
        id: 'm1',
        senderUserId: 'user-2',
        createdAt: '2026-07-30T12:00:00.000Z',
      }),
      makeDirectMessage({
        id: 'm2',
        senderUserId: 'user-2',
        createdAt: '2026-07-30T12:04:59.000Z',
      }),
      makeDirectMessage({
        id: 'm3',
        senderUserId: 'user-1',
        createdAt: '2026-07-30T12:05:00.000Z',
      }),
    ])

    expect(groups).toHaveLength(2)
    expect(groups[0]?.messages.map((message) => message.id)).toEqual(['m1', 'm2'])
    expect(groups[0]?.timestamp).toBe('2026-07-30T12:04:59.000Z')
    expect(groups[1]?.messages.map((message) => message.id)).toEqual(['m3'])
  })

  it('starts a new group when the gap exceeds five minutes', () => {
    const groups = groupMessagesByTime([
      makeDirectMessage({
        id: 'm1',
        senderUserId: 'user-2',
        createdAt: '2026-07-30T12:00:00.000Z',
      }),
      makeDirectMessage({
        id: 'm2',
        senderUserId: 'user-2',
        createdAt: '2026-07-30T12:05:01.000Z',
      }),
    ])

    expect(groups).toHaveLength(2)
    expect(groups[0]?.messages).toHaveLength(1)
    expect(groups[1]?.messages).toHaveLength(1)
  })

  it('starts a new group when the sender changes', () => {
    const groups = groupMessagesByTime([
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
      makeDirectMessage({
        id: 'm3',
        senderUserId: 'user-2',
        createdAt: '2026-07-30T12:02:00.000Z',
      }),
    ])

    expect(groups).toHaveLength(3)
  })
})
