import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'

import { makeDirectMessage } from '@/test/fixtures/messages'
import { renderWithProviders } from '@/test/render'

import { MessageThreadBody } from './message-thread-body.client'
import { buildMessageThreadSegments } from '../lib/build-message-thread-segments.lib'

vi.mock('@/lib/react/use-relative-time-now', () => ({
  useRelativeTimeNow: () => new Date('2026-07-30T15:00:00.000Z'),
}))

function createSendMessage() {
  return {
    mutateAsync: vi.fn().mockResolvedValue(undefined),
    isPending: false,
  }
}

describe('MessageThreadBody', () => {
  it('renders exactly one timestamp per message group and none inside bubble divs', () => {
    const messages = [
      makeDirectMessage({
        id: 'm1',
        senderUserId: 'user-2',
        createdAt: '2026-07-30T12:00:00.000Z',
      }),
      makeDirectMessage({
        id: 'm2',
        senderUserId: 'user-2',
        createdAt: '2026-07-30T12:04:00.000Z',
      }),
      makeDirectMessage({
        id: 'm3',
        senderUserId: 'user-1',
        createdAt: '2026-07-30T12:05:00.000Z',
      }),
    ]
    const expectedGroupCount = buildMessageThreadSegments(messages).filter(
      (segment) => segment.type === 'message-group',
    ).length

    const { container } = renderWithProviders(
      <MessageThreadBody
        currentUserId="user-1"
        peerDisplayName="Peer"
        messages={messages}
        hasNextPage={false}
        isFetchingNextPage={false}
        isFetchNextPageError={false}
        fetchNextPage={vi.fn()}
        sendMessage={createSendMessage() as never}
        showComposer={false}
      />,
    )

    const groupTimestamps = container.querySelectorAll(
      'ul[aria-label="Messages"] > li.self-start time, ul[aria-label="Messages"] > li.self-end time',
    )
    expect(groupTimestamps).toHaveLength(expectedGroupCount)
    expect(container.querySelectorAll('div[aria-label] time')).toHaveLength(0)
  })

  it('renders one timestamp per date separator segment', () => {
    const messages = [
      makeDirectMessage({
        id: 'm1',
        createdAt: '2026-07-29T12:00:00.000Z',
      }),
      makeDirectMessage({
        id: 'm2',
        senderUserId: 'user-1',
        createdAt: '2026-07-30T12:00:00.000Z',
      }),
    ]
    const expectedSeparatorCount = buildMessageThreadSegments(messages).filter(
      (segment) => segment.type === 'date-separator',
    ).length

    const { container } = renderWithProviders(
      <MessageThreadBody
        currentUserId="user-1"
        peerDisplayName="Peer"
        messages={messages}
        hasNextPage={false}
        isFetchingNextPage={false}
        isFetchNextPageError={false}
        fetchNextPage={vi.fn()}
        sendMessage={createSendMessage() as never}
        showComposer={false}
      />,
    )

    expect(container.querySelectorAll('li.text-center time')).toHaveLength(expectedSeparatorCount)
  })

  it('omits the composer when showComposer is false', () => {
    renderWithProviders(
      <MessageThreadBody
        currentUserId="user-1"
        peerDisplayName="Peer"
        messages={[]}
        hasNextPage={false}
        isFetchingNextPage={false}
        isFetchNextPageError={false}
        fetchNextPage={vi.fn()}
        sendMessage={createSendMessage() as never}
        showComposer={false}
      />,
    )

    expect(screen.queryByRole('button', { name: 'Send' })).not.toBeInTheDocument()
  })
})
