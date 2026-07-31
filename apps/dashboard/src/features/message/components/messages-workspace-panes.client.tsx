'use client'

import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { Text, toast } from '@rpg/ui'

import { ROUTES } from '@/app/routes'
import { IndexPageEmptyState } from '@/components/layout/index-page-intro'
import { useSetBreadcrumbLabel } from '@/components/layout/use-breadcrumb-label'
import { useSession } from '@/features/auth'
import { useRealtimeStatus } from '@/features/realtime'

import { ConversationList, NewMessageLink } from './conversation-list.client'
import { MessageThreadBody } from './message-thread-body.client'
import { MessagesMobileBackLink } from './messages-workspace-empty-states.client'
import {
  messagesWorkspaceRightPaneClasses,
  messagesWorkspaceRightScrollClasses,
} from './messages-workspace.variants'
import { NewMessageRecipientsBody } from './new-message-form.client'
import { useConversationActions } from '../hooks/use-conversation-actions'
import { useConversationMessages } from '../hooks/use-conversation-messages'
import { useConversationRecipients } from '../hooks/use-conversation-recipients'
import { useConversations } from '../hooks/use-conversations'
import { useMessageThreadMarkRead } from '../hooks/use-message-thread-mark-read'
import { flattenDirectConversationRecipients } from '../lib/messages-workspace-routing.lib'
import { flattenConversationMessages } from '../lib/sort-messages-chronologically'

export function MessagesThreadPane({ conversationId }: { conversationId: string }) {
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
    setActiveConversationId(conversationId)
    return () => setActiveConversationId(null)
  }, [conversationId, setActiveConversationId])

  if (isPending) {
    return (
      <div className={messagesWorkspaceRightScrollClasses}>
        <Text variant="muted">Loading messages…</Text>
      </div>
    )
  }

  if (isError) {
    return (
      <div className={messagesWorkspaceRightScrollClasses}>
        <Text variant="destructive" role="alert">
          Could not load messages.
        </Text>
      </div>
    )
  }

  return (
    <div className={`${messagesWorkspaceRightPaneClasses} min-h-0 flex-1`}>
      <MessageThreadBody
        currentUserId={session?.user?.id}
        peerDisplayName={peerDisplayName}
        messages={messages}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        isFetchNextPageError={isFetchNextPageError}
        fetchNextPage={fetchNextPage}
        sendMessage={sendMessage}
        layout="workspace"
      />
    </div>
  )
}

export function MessagesRecipientPickerPane() {
  const navigate = useNavigate()
  const { data, isPending, isError } = useConversationRecipients()
  const { createConversation } = useConversationActions()
  const [recipientUserId, setRecipientUserId] = React.useState('')

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!recipientUserId) return

    const existingConversationId = data?.existingDirectByUserId[recipientUserId]
    if (existingConversationId) {
      navigate(ROUTES.messages.detail(existingConversationId))
      return
    }

    void createConversation
      .mutateAsync(recipientUserId)
      .then(({ conversation }) => {
        navigate(ROUTES.messages.detail(conversation.id))
      })
      .catch(() => {
        toast.error('Could not start conversation.')
      })
  }

  return (
    <div className="p-4">
      <MessagesMobileBackLink to={ROUTES.messages.list} label="Back to messages" />
      <Text as="h2" variant="lead" className="mb-4">
        New message
      </Text>
      <NewMessageRecipientsBody
        isPending={isPending}
        isError={isError}
        recipients={flattenDirectConversationRecipients(data?.recipientsByUserId ?? {})}
        formProps={{
          recipientUserId,
          onRecipientChange: setRecipientUserId,
          onSubmit: handleSubmit,
          onCancel: () => navigate(ROUTES.messages.list),
          isSubmitting: createConversation.isPending,
        }}
      />
    </div>
  )
}

export function MessagesDirectListPane({
  activeConversationId,
}: {
  activeConversationId?: string
}) {
  const { data, isPending, isError } = useConversations()
  const conversations = data?.items ?? []

  return (
    <div className="p-4">
      {isPending ? <Text variant="muted">Loading conversations…</Text> : null}
      {isError ? (
        <Text variant="destructive" role="alert">
          Could not load conversations.
        </Text>
      ) : null}

      {!isPending && !isError && conversations.length === 0 ? (
        <IndexPageEmptyState
          heading="No conversations yet"
          body="Start a direct message with someone from your campaigns."
          actions={<NewMessageLink />}
        />
      ) : null}

      {!isPending && !isError && conversations.length > 0 ? (
        <ConversationList
          conversations={conversations}
          activeConversationId={activeConversationId}
        />
      ) : null}
    </div>
  )
}
