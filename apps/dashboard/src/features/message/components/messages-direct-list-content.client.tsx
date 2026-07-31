'use client'

import type { Conversation, ConversationListScope } from '@rpg/contracts'
import { Text } from '@rpg/ui'

import { ConversationList } from './conversation-list.client'
import { MessagesDirectListEmptyState } from './messages-direct-list-empty-state.client'
import { MessagesDirectListStatus } from './messages-direct-list-status.client'
import { MessagesOutOfScopePin } from './messages-campaign-scope.client'
import {
  isScopedConversationListEmpty,
  resolveOutOfScopeConversation,
} from '../lib/messages-campaign-scope-state.lib'
import {
  resolveDirectListVisibility,
  shouldShowLoadedScopeHint,
} from '../lib/messages-direct-list-presentation.lib'
import { formatMessagesLoadedScopeHint } from '../lib/messages-copy'
import { messagesWorkspaceListChromeInsetClasses } from './messages-workspace.variants'

type MessagesDirectListContentProps = {
  activeConversationId?: string
  campaignId?: string
  scope?: ConversationListScope
  conversations: Conversation[]
  unscopedConversations?: Conversation[]
  isPending: boolean
  isError: boolean
  loadedCount: number
  scopedCount?: number
  hasMoreConversations: boolean
}

function MessagesLoadedScopeHint({
  loadedCount,
  scopedCount,
}: {
  loadedCount: number
  scopedCount: number
}) {
  return (
    <Text
      variant="small"
      className={`mb-2 text-muted-foreground ${messagesWorkspaceListChromeInsetClasses}`}
    >
      {formatMessagesLoadedScopeHint(loadedCount, scopedCount)}
    </Text>
  )
}

export function MessagesDirectListContent(props: MessagesDirectListContentProps) {
  const outOfScopeConversation = resolveOutOfScopeConversation({
    campaignId: props.campaignId,
    scope: props.scope,
    activeConversationId: props.activeConversationId,
    scopedConversations: props.conversations,
    unscopedConversations: props.unscopedConversations,
  })

  const isScopedEmpty = isScopedConversationListEmpty({
    campaignId: props.campaignId,
    isPending: props.isPending,
    isError: props.isError,
    conversationCount: props.conversations.length,
  })

  const { showEmptyState, showConversationList } = resolveDirectListVisibility({
    isPending: props.isPending,
    isError: props.isError,
    conversationCount: props.conversations.length,
    hasOutOfScopeConversation: Boolean(outOfScopeConversation),
  })

  const scopeHint =
    shouldShowLoadedScopeHint(props) && props.scopedCount !== undefined
      ? { loadedCount: props.loadedCount, scopedCount: props.scopedCount }
      : null

  return (
    <>
      {outOfScopeConversation && props.scope ? (
        <MessagesOutOfScopePin
          campaignName={props.scope.campaignName}
          campaignId={props.scope.campaignId}
          conversationId={outOfScopeConversation.id}
          peerDisplayName={outOfScopeConversation.peer.displayName}
          isActive={props.activeConversationId === outOfScopeConversation.id}
        />
      ) : null}

      <MessagesDirectListStatus isPending={props.isPending} isError={props.isError} />

      {showEmptyState ? (
        <MessagesDirectListEmptyState campaignId={props.campaignId} isScopedEmpty={isScopedEmpty} />
      ) : null}

      {scopeHint ? (
        <MessagesLoadedScopeHint
          loadedCount={scopeHint.loadedCount}
          scopedCount={scopeHint.scopedCount}
        />
      ) : null}

      {showConversationList ? (
        <ConversationList
          conversations={props.conversations}
          activeConversationId={props.activeConversationId}
          campaignId={props.campaignId}
          scope={props.scope}
        />
      ) : null}
    </>
  )
}
