import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'

import { useMessageThreadMarkRead } from './use-message-thread-mark-read'

function createMarkRead() {
  return {
    mutateAsync: vi.fn().mockResolvedValue(undefined),
  }
}

describe('useMessageThreadMarkRead', () => {
  beforeEach(() => {
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: 'visible',
    })
    vi.spyOn(document, 'hasFocus').mockReturnValue(true)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('marks read on initial open when visible without requiring focus', async () => {
    vi.spyOn(document, 'hasFocus').mockReturnValue(false)
    const markRead = createMarkRead()

    renderHook(() =>
      useMessageThreadMarkRead({
        conversationId: 'conversation-1',
        latestMessageId: 'message-1',
        latestMessageSenderUserId: 'user-2',
        currentUserId: 'user-1',
        isAttentionEligible: true,
        isLoaded: true,
        markRead: markRead as never,
      }),
    )

    await waitFor(() => {
      expect(markRead.mutateAsync).toHaveBeenCalledWith('message-1')
    })
  })

  it('does not mark read when attention is ineligible', async () => {
    const markRead = createMarkRead()

    renderHook(() =>
      useMessageThreadMarkRead({
        conversationId: 'conversation-1',
        latestMessageId: 'message-1',
        latestMessageSenderUserId: 'user-2',
        currentUserId: 'user-1',
        isAttentionEligible: false,
        isLoaded: true,
        markRead: markRead as never,
      }),
    )

    await waitFor(() => {
      expect(markRead.mutateAsync).not.toHaveBeenCalled()
    })
  })

  it('does not mark read when the latest message was sent by the viewer', async () => {
    const markRead = createMarkRead()

    renderHook(() =>
      useMessageThreadMarkRead({
        conversationId: 'conversation-1',
        latestMessageId: 'message-1',
        latestMessageSenderUserId: 'user-1',
        currentUserId: 'user-1',
        isAttentionEligible: true,
        isLoaded: true,
        markRead: markRead as never,
      }),
    )

    await waitFor(() => {
      expect(markRead.mutateAsync).not.toHaveBeenCalled()
    })
  })

  it('requires focus for new inbound messages while already open', async () => {
    vi.spyOn(document, 'hasFocus').mockReturnValue(false)
    const markRead = createMarkRead()

    const { rerender } = renderHook(
      (props: { latestMessageId: string }) =>
        useMessageThreadMarkRead({
          conversationId: 'conversation-1',
          latestMessageId: props.latestMessageId,
          latestMessageSenderUserId: 'user-2',
          currentUserId: 'user-1',
          isAttentionEligible: true,
          isLoaded: true,
          markRead: markRead as never,
        }),
      { initialProps: { latestMessageId: 'message-1' } },
    )

    await waitFor(() => {
      expect(markRead.mutateAsync).toHaveBeenCalledWith('message-1')
    })

    markRead.mutateAsync.mockClear()
    rerender({ latestMessageId: 'message-2' })

    await waitFor(() => {
      expect(markRead.mutateAsync).not.toHaveBeenCalled()
    })
  })

  it('does not mark read while the document is hidden', async () => {
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: 'hidden',
    })
    const markRead = createMarkRead()

    renderHook(() =>
      useMessageThreadMarkRead({
        conversationId: 'conversation-1',
        latestMessageId: 'message-1',
        latestMessageSenderUserId: 'user-2',
        currentUserId: 'user-1',
        isAttentionEligible: true,
        isLoaded: true,
        markRead: markRead as never,
      }),
    )

    await waitFor(() => {
      expect(markRead.mutateAsync).not.toHaveBeenCalled()
    })
  })
})
