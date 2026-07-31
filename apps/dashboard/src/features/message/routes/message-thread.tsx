'use client'

import { Link, useParams } from 'react-router-dom'
import * as React from 'react'
import { Text } from '@rpg/ui'

import { ROUTES } from '@/app/routes'
import { NarrowPage } from '@/components/layout/narrow-page'
import { useSetBreadcrumbLabel } from '@/components/layout/use-breadcrumb-label'
import { useSession } from '@/features/auth'
import { useRealtimeStatus } from '@/features/realtime'

import { MessageThreadBody } from '../components/message-thread-body.client'
import { useConversationActions } from '../hooks/use-conversation-actions'
import { useConversationMessages } from '../hooks/use-conversation-messages'
import { useConversations } from '../hooks/use-conversations'
import { useMessageThreadMarkRead } from '../hooks/use-message-thread-mark-read'
import { flattenConversationMessages } from '../lib/sort-messages-chronologically'

export function MessageThread() {
  const { conversationId } = useParams<{ conversationId: string }>()
  const { data: session } = useSession()
  const { setActiveConversationId } = useRealtimeStatus()
  const { data: conversationsData } = useConversations()
  const {
    data: messagesData,
    isPending,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
  } = useConversationMessages(conversationId)
  const { sendMessage, markRead } = useConversationActions(conversationId)

  const conversation = conversationsData?.items.find((item) => item.id === conversationId)
  const peerDisplayName = conversation?.peer.displayName
  useSetBreadcrumbLabel(peerDisplayName)
  const messages = flattenConversationMessages(messagesData?.pages)
  const latestMessageId = messages.at(-1)?.id

  useMessageThreadMarkRead({
    conversationId,
    latestMessageId,
    markRead,
  })

  React.useEffect(() => {
    if (!conversationId) return
    setActiveConversationId(conversationId)
    return () => setActiveConversationId(null)
  }, [conversationId, setActiveConversationId])

  return (
    <NarrowPage spacing="relaxed">
      <div className="flex items-center gap-3">
        <Link
          to={ROUTES.messages.list}
          className="text-sm text-muted-foreground hover:text-foreground"
          aria-label="Back to messages"
        >
          Back
        </Link>
        <Text as="h1" variant="lead">
          {peerDisplayName ?? 'Conversation'}
        </Text>
      </div>

      {isPending ? <Text variant="muted">Loading messages…</Text> : null}
      {isError ? (
        <Text variant="destructive" role="alert">
          Could not load messages.
        </Text>
      ) : null}

      {!isPending && !isError && conversationId ? (
        <MessageThreadBody
          currentUserId={session?.user?.id}
          peerDisplayName={peerDisplayName}
          messages={messages}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          isFetchNextPageError={isFetchNextPageError}
          fetchNextPage={fetchNextPage}
          sendMessage={sendMessage}
        />
      ) : null}
    </NarrowPage>
  )
}
