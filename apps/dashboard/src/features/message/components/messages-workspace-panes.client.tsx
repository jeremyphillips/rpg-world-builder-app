'use client'

import * as React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Text, toast } from '@rpg/ui'
import type { ConversationListScope } from '@rpg/contracts'

import { ROUTES } from '@/app/routes'
import { IndexPageEmptyState } from '@/components/layout/page/index-page-intro'
import { useSetBreadcrumbLabel } from '@/components/layout/breadcrumb/use-breadcrumb-label'

import { MessagesDirectListContent } from './messages-direct-list-content.client'
import { MessageThreadBody } from './message-thread-body.client'
import { MessageComposer } from './message-composer.client'
import { MessageThreadHeader } from './message-thread-header.client'
import { MessagesMetadata } from './messages-metadata.client'
import { MessagesThreadPreviewChrome } from './messages-thread-preview-chrome.client'
import { MessagesMobileBackLink } from './messages-workspace-empty-states.client'
import {
  messagesWorkspaceRightFooterClasses,
  messagesWorkspaceRightPaneClasses,
  messagesWorkspaceRightScrollClasses,
} from './messages-workspace.variants'
import { NewMessageRecipientsBody } from './new-message-form.client'
import { useConversationActions } from '../hooks/use-conversation-actions'
import { useConversationRecipients } from '../hooks/use-conversation-recipients'
import { useOutOfScopeConversationLookup } from '../hooks/use-out-of-scope-conversation-lookup'
import { useMessagesThreadPane } from '../hooks/use-messages-thread-pane'
import {
  MESSAGES_ACTION_COPY,
  MESSAGES_EMPTY_COPY,
  MESSAGES_ERROR_COPY,
  MESSAGES_PREVIEW_COPY,
  MESSAGES_STALE_RECIPIENT_COPY,
  MESSAGES_STATUS_COPY,
} from '../lib/messages-copy'
import type { MessagesThreadMode } from '../lib/messages-thread-mode.lib'
import { resolveMessagesThreadModeBehavior } from '../lib/messages-thread-mode.lib'
import {
  flattenDirectConversationRecipients,
  getMessagesFromConversationId,
  resolveMessagesNewCancelTarget,
} from '../lib/messages-workspace-routing.lib'
import { resolveRecipientSharedCampaigns } from '../lib/resolve-recipient-shared-campaigns.lib'

export function MessagesThreadPane({
  conversationId,
  campaignId,
  threadMode = 'active',
  isPaneVisible = true,
}: {
  conversationId: string
  campaignId?: string
  threadMode?: MessagesThreadMode
  isPaneVisible?: boolean
}) {
  const { showComposer, isAttentionEligible, showPreviewChrome } =
    resolveMessagesThreadModeBehavior(threadMode)
  const {
    session,
    conversation,
    peerDisplayName,
    messages,
    sendMessage,
    isPending,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
  } = useMessagesThreadPane({
    conversationId,
    campaignId,
    isAttentionEligible,
    isPaneVisible,
  })

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
      {showPreviewChrome ? <MessagesThreadPreviewChrome /> : null}
      <MessageThreadHeader
        peerDisplayName={peerDisplayName}
        sharedCampaigns={conversation?.sharedCampaigns ?? []}
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
        showComposer={showComposer}
      />
    </div>
  )
}

export function MessagesRecipientPickerPane({ campaignId }: { campaignId?: string }) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { data, isPending, isError } = useConversationRecipients(campaignId)
  const [recipientUserId, setRecipientUserId] = React.useState('')

  const recipients = flattenDirectConversationRecipients(data?.recipientsByUserId ?? {})
  const isScopedEmpty = Boolean(campaignId && !isPending && !isError && recipients.length === 0)
  const fromConversationId = getMessagesFromConversationId(searchParams.toString())
  const cancelTarget = resolveMessagesNewCancelTarget({
    fromConversationId,
    campaignId,
  })

  const handleRecipientChange = (nextRecipientUserId: string) => {
    setRecipientUserId(nextRecipientUserId)
    if (!nextRecipientUserId) return

    const existingConversationId = data?.existingDirectByUserId[nextRecipientUserId]
    if (existingConversationId) {
      navigate(ROUTES.messages.detail(existingConversationId, { campaignId }))
      return
    }

    navigate(
      ROUTES.messages.new({
        to: nextRecipientUserId,
        campaignId,
        ...(fromConversationId ? { from: fromConversationId } : {}),
      }),
    )
  }

  return (
    <div className="p-4">
      <MessagesMobileBackLink to={cancelTarget} label={MESSAGES_ACTION_COPY.backToMessages} />
      {fromConversationId ? (
        <MessagesMetadata className="mb-3">
          {MESSAGES_PREVIEW_COPY.selectRecipientBody}
        </MessagesMetadata>
      ) : null}
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
            onRecipientChange: handleRecipientChange,
          }}
        />
      )}
    </div>
  )
}

export function MessagesDraftThreadPane({
  toRecipientUserId,
  campaignId,
}: {
  toRecipientUserId: string
  campaignId?: string
}) {
  const navigate = useNavigate()
  const { data, isPending, isError } = useConversationRecipients(campaignId, {
    refetchOnMount: 'always',
  })
  const { sendFirstMessage } = useConversationActions()
  const [draft, setDraft] = React.useState('')
  const clientMessageIdRef = React.useRef<string | null>(null)

  const peer = data?.recipientsByUserId[toRecipientUserId]
  const sharedCampaigns = resolveRecipientSharedCampaigns(data, toRecipientUserId)

  useSetBreadcrumbLabel(peer?.displayName)

  const handleSend = () => {
    const text = draft.trim()
    if (!text) return

    if (!clientMessageIdRef.current) {
      clientMessageIdRef.current = crypto.randomUUID()
    }

    void sendFirstMessage
      .mutateAsync({
        recipientUserId: toRecipientUserId,
        content: { kind: 'text', text },
        clientMessageId: clientMessageIdRef.current,
      })
      .then(({ conversation }) => {
        navigate(ROUTES.messages.detail(conversation.id, { campaignId }), { replace: true })
      })
      .catch(() => {
        toast.error(MESSAGES_ERROR_COPY.sendMessage)
      })
  }

  if (isPending) {
    return (
      <div className={messagesWorkspaceRightScrollClasses}>
        <Text variant="muted">{MESSAGES_STATUS_COPY.loadingRecipients}</Text>
      </div>
    )
  }

  if (isError) {
    return (
      <div className={messagesWorkspaceRightScrollClasses}>
        <Text variant="destructive" role="alert">
          {MESSAGES_ERROR_COPY.loadRecipients}
        </Text>
      </div>
    )
  }

  if (!peer) {
    return (
      <div className={`${messagesWorkspaceRightPaneClasses} min-h-0 flex-1 p-4`}>
        <MessagesMobileBackLink
          to={campaignId ? ROUTES.messages.listScoped(campaignId) : ROUTES.messages.list}
          label={MESSAGES_ACTION_COPY.backToMessages}
        />
        <IndexPageEmptyState
          heading={MESSAGES_STALE_RECIPIENT_COPY.heading}
          body=""
          actions={
            <button
              type="button"
              className="text-sm text-primary hover:underline"
              onClick={() => navigate(ROUTES.messages.new({ campaignId }))}
            >
              {MESSAGES_STALE_RECIPIENT_COPY.action}
            </button>
          }
        />
      </div>
    )
  }

  return (
    <div className={`${messagesWorkspaceRightPaneClasses} min-h-0 flex-1`}>
      <MessageThreadHeader peerDisplayName={peer.displayName} sharedCampaigns={sharedCampaigns} />
      <div className={messagesWorkspaceRightFooterClasses}>
        <MessageComposer
          draft={draft}
          onDraftChange={setDraft}
          onSubmit={handleSend}
          isSubmitting={sendFirstMessage.isPending}
        />
      </div>
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
  const {
    data,
    isPending,
    isError,
    unscopedData,
    lookedUpConversation,
    isConversationLookupError,
  } = useOutOfScopeConversationLookup(activeConversationId, campaignId)

  return (
    <MessagesDirectListContent
      activeConversationId={activeConversationId}
      campaignId={campaignId}
      scope={scope}
      conversations={data?.items ?? []}
      unscopedConversations={unscopedData?.items}
      lookedUpConversation={lookedUpConversation}
      isConversationLookupError={isConversationLookupError}
      isPending={isPending}
      isError={isError}
      loadedCount={loadedCount}
      scopedCount={scopedCount ?? data?.scopedCount}
      hasMoreConversations={hasMoreConversations}
    />
  )
}
