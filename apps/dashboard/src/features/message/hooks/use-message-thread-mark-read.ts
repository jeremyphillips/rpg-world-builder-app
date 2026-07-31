import * as React from 'react'
import { toast } from '@rpg/ui'

import { useDocumentVisible } from '@/lib/react/use-document-visible'

import type { useConversationActions } from './use-conversation-actions'
import { MESSAGES_ERROR_COPY } from '../lib/messages-copy'
import {
  isIncomingUnreadLatestMessage,
  isMessageThreadMarkReadDocumentEligible,
  resolveMessageThreadMarkReadTrigger,
} from '../lib/resolve-message-thread-mark-read-eligibility.lib'

function useDocumentFocused(): boolean {
  const [focused, setFocused] = React.useState(
    () => typeof document !== 'undefined' && document.hasFocus(),
  )

  React.useEffect(() => {
    const syncFocus = () => {
      setFocused(document.hasFocus())
    }

    window.addEventListener('focus', syncFocus)
    window.addEventListener('blur', syncFocus)
    return () => {
      window.removeEventListener('focus', syncFocus)
      window.removeEventListener('blur', syncFocus)
    }
  }, [])

  return focused
}

export function useMessageThreadMarkRead({
  conversationId,
  latestMessageId,
  latestMessageSenderUserId,
  currentUserId,
  isAttentionEligible,
  isLoaded,
  markRead,
}: {
  conversationId: string | undefined
  latestMessageId: string | undefined
  latestMessageSenderUserId: string | undefined
  currentUserId: string | undefined
  isAttentionEligible: boolean
  isLoaded: boolean
  markRead: ReturnType<typeof useConversationActions>['markRead']
}) {
  const lastMarkedReadMessageIdRef = React.useRef<string | null>(null)
  const processedLatestMessageIdRef = React.useRef<string | null>(null)
  const hasCompletedInitialOpenRef = React.useRef(false)
  const isDocumentVisible = useDocumentVisible()
  const isDocumentFocused = useDocumentFocused()

  React.useEffect(() => {
    lastMarkedReadMessageIdRef.current = null
    processedLatestMessageIdRef.current = null
    hasCompletedInitialOpenRef.current = false
  }, [conversationId])

  React.useEffect(() => {
    if (!isAttentionEligible || !isLoaded || !conversationId || !latestMessageId) return
    if (!isIncomingUnreadLatestMessage({ latestMessageSenderUserId, currentUserId })) return
    if (lastMarkedReadMessageIdRef.current === latestMessageId) return

    const trigger = resolveMessageThreadMarkReadTrigger({
      hasCompletedInitialOpen: hasCompletedInitialOpenRef.current,
      processedLatestMessageId: processedLatestMessageIdRef.current,
      latestMessageId,
    })
    if (!trigger) return

    if (
      !isMessageThreadMarkReadDocumentEligible({
        trigger,
        isDocumentVisible,
        isDocumentFocused,
      })
    ) {
      return
    }

    processedLatestMessageIdRef.current = latestMessageId
    if (trigger === 'initial-open') {
      hasCompletedInitialOpenRef.current = true
    }

    lastMarkedReadMessageIdRef.current = latestMessageId
    void markRead.mutateAsync(latestMessageId).catch(() => {
      lastMarkedReadMessageIdRef.current = null
      toast.error(MESSAGES_ERROR_COPY.markConversationRead)
    })
  }, [
    conversationId,
    currentUserId,
    isAttentionEligible,
    isDocumentFocused,
    isDocumentVisible,
    isLoaded,
    latestMessageId,
    latestMessageSenderUserId,
    markRead,
  ])
}
