import * as React from 'react'
import { toast } from '@rpg/ui'

import type { useConversationActions } from './use-conversation-actions'
import { MESSAGES_ERROR_COPY } from '../lib/messages-copy'

export function useMessageThreadMarkRead({
  conversationId,
  latestMessageId,
  markRead,
}: {
  conversationId: string | undefined
  latestMessageId: string | undefined
  markRead: ReturnType<typeof useConversationActions>['markRead']
}) {
  const lastMarkedReadMessageIdRef = React.useRef<string | null>(null)

  React.useEffect(() => {
    if (!conversationId || !latestMessageId) return
    if (lastMarkedReadMessageIdRef.current === latestMessageId) return

    lastMarkedReadMessageIdRef.current = latestMessageId
    void markRead.mutateAsync(latestMessageId).catch(() => {
      lastMarkedReadMessageIdRef.current = null
      toast.error(MESSAGES_ERROR_COPY.markConversationRead)
    })
  }, [conversationId, latestMessageId, markRead])
}
