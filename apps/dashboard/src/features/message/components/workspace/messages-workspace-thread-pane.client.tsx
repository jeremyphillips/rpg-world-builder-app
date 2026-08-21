'use client'

/**
 * Parent: MessagesWorkspaceThreadSection (MessagesWorkspaceActiveThread, MessagesWorkspacePreviewThread)
 * Route context: active conversation thread and desktop preview thread on /messages/new?from=
 */
import { Text } from '@rpg/ui'

import { MessageThreadBody } from '../thread/message-thread-body.client'
import { MessageThreadHeader } from '../thread/message-thread-header.client'
import { MessagesThreadPreviewChrome } from '../thread/messages-thread-preview-chrome.client'
import {
  messagesWorkspaceRightPaneClasses,
  messagesWorkspaceRightScrollClasses,
  messagesWorkspaceRightFooterClasses,
} from './messages-workspace.variants'
import { useMessagesThreadPane } from '../../hooks/use-messages-thread-pane'
import { MESSAGES_ERROR_COPY, MESSAGES_STATUS_COPY } from '../../lib/messages-copy'
import type { MessagesThreadMode } from '../../lib/messages-thread-mode.lib'
import { resolveMessagesThreadModeBehavior } from '../../lib/messages-thread-mode.lib'

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
        scrollWrapperClassName={messagesWorkspaceRightScrollClasses}
        footerWrapperClassName={messagesWorkspaceRightFooterClasses}
      />
    </div>
  )
}
