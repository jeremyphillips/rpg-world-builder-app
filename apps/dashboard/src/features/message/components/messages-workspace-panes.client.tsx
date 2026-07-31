'use client'

import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { Text, toast } from '@rpg/ui'
import type { ConversationListScope } from '@rpg/contracts'

import { ROUTES } from '@/app/routes'
import { IndexPageEmptyState } from '@/components/layout/index-page-intro'
import { useSetBreadcrumbLabel } from '@/components/layout/use-breadcrumb-label'
import { useSession } from '@/features/auth'
import { useRealtimeStatus } from '@/features/realtime'

import { MessagesDirectListContent } from './messages-direct-list-content.client'
import { MessageThreadBody } from './message-thread-body.client'
import { MessageThreadHeader } from './message-thread-header.client'
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
import {
  MESSAGES_ACTION_COPY,
  MESSAGES_EMPTY_COPY,
  MESSAGES_ERROR_COPY,
  MESSAGES_STATUS_COPY,
} from '../lib/messages-copy'
import { flattenDirectConversationRecipients } from '../lib/messages-workspace-routing.lib'
import { flattenConversationMessages } from '../lib/sort-messages-chronologically'

export function MessagesThreadPane({
  conversationId,
  campaignId,
}: {
  conversationId: string
  campaignId?: string
}) {
  const { data: session } = useSession()
  const { setActiveConversationId } = useRealtimeStatus()
  const { data: conversationsData } = useConversations(campaignId)
  const conversationInScopedList = conversationsData?.items.some(
    (item) => item.id === conversationId,
  )
  const { data: unscopedConversationsData } = useConversations(undefined, {
    enabled: Boolean(campaignId && conversationsData && !conversationInScopedList),
  })
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

  const conversation =
    conversationsData?.items.find((item) => item.id === conversationId) ??
    unscopedConversationsData?.items.find((item) => item.id === conversationId)
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
        <Text variant="muted">{MESSAGES_STATUS_COPY.loadingMessages}</Text>
      </div>
    )
  }

  if (isError) {
    return (
      <div className={messagesWorkspaceRightScrollClasses}>
        <Text variant="destructive" role="alert">
          {MESSAGES_ERROR_COPY.loadMessages}
        </Text>
      </div>
    )
  }

  return (
    <div className={`${messagesWorkspaceRightPaneClasses} min-h-0 flex-1`}>
      <MessageThreadHeader
        peerDisplayName={peerDisplayName}
        sharedCampaignCount={conversation?.sharedCampaigns.length ?? 0}
      />
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

export function MessagesRecipientPickerPane({ campaignId }: { campaignId?: string }) {
  const navigate = useNavigate()
  const { data, isPending, isError } = useConversationRecipients(campaignId)
  const { createConversation } = useConversationActions()
  const [recipientUserId, setRecipientUserId] = React.useState('')

  const recipients = flattenDirectConversationRecipients(data?.recipientsByUserId ?? {})
  const isScopedEmpty = Boolean(campaignId && !isPending && !isError && recipients.length === 0)

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!recipientUserId) return

    const existingConversationId = data?.existingDirectByUserId[recipientUserId]
    if (existingConversationId) {
      navigate(ROUTES.messages.detail(existingConversationId, { campaignId }))
      return
    }

    void createConversation
      .mutateAsync(recipientUserId)
      .then(({ conversation }) => {
        navigate(ROUTES.messages.detail(conversation.id, { campaignId }))
      })
      .catch(() => {
        toast.error(MESSAGES_ERROR_COPY.startConversation)
      })
  }

  return (
    <div className="p-4">
      <MessagesMobileBackLink
        to={campaignId ? ROUTES.messages.listScoped(campaignId) : ROUTES.messages.list}
        label={MESSAGES_ACTION_COPY.backToMessages}
      />
      <Text as="h2" variant="lead" className="mb-4">
        {MESSAGES_ACTION_COPY.newMessage}
      </Text>
      {isScopedEmpty ? (
        <IndexPageEmptyState
          heading={MESSAGES_EMPTY_COPY.scopedRecipientHeading}
          body={MESSAGES_EMPTY_COPY.scopedRecipientBody}
        />
      ) : (
        <NewMessageRecipientsBody
          isPending={isPending}
          isError={isError}
          recipients={recipients}
          formProps={{
            recipientUserId,
            onRecipientChange: setRecipientUserId,
            onSubmit: handleSubmit,
            onCancel: () =>
              navigate(campaignId ? ROUTES.messages.listScoped(campaignId) : ROUTES.messages.list),
            isSubmitting: createConversation.isPending,
          }}
        />
      )}
    </div>
  )
}

export function MessagesDirectListPane({
  activeConversationId,
  campaignId,
  scope,
  loadedCount,
  scopedCount,
  hasMoreConversations,
}: {
  activeConversationId?: string
  campaignId?: string
  scope?: ConversationListScope
  loadedCount: number
  scopedCount?: number
  hasMoreConversations: boolean
}) {
  const { data, isPending, isError } = useConversations(campaignId)
  const conversationInScopedList = data?.items.some((item) => item.id === activeConversationId)
  const { data: unscopedData } = useConversations(undefined, {
    enabled: Boolean(campaignId && activeConversationId && data && !conversationInScopedList),
  })

  return (
    <div className="p-4">
      <MessagesDirectListContent
        activeConversationId={activeConversationId}
        campaignId={campaignId}
        scope={scope}
        conversations={data?.items ?? []}
        unscopedConversations={unscopedData?.items}
        isPending={isPending}
        isError={isError}
        loadedCount={loadedCount}
        scopedCount={scopedCount ?? data?.scopedCount}
        hasMoreConversations={hasMoreConversations}
      />
    </div>
  )
}
