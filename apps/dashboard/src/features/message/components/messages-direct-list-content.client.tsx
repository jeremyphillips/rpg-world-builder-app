'use client'

import type { Conversation, ConversationListScope } from '@rpg/contracts'

import { ConversationList } from './conversation-list.client'
import { MessagesDirectListEmptyState } from './messages-direct-list-empty-state.client'
import { MessagesDirectListStatus } from './messages-direct-list-status.client'
import { MessagesOutOfScopePin } from './messages-campaign-scope.client'
import {
  isScopedConversationListEmpty,
  resolveOutOfScopeConversation,
} from '../lib/messages-campaign-scope-state.lib'

type MessagesDirectListContentProps = {
  activeConversationId?: string
  campaignId?: string
  scope?: ConversationListScope
  conversations: Conversation[]
  unscopedConversations?: Conversation[]
  isPending: boolean
  isError: boolean
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

  const showEmptyState =
    !props.isPending &&
    !props.isError &&
    props.conversations.length === 0 &&
    !outOfScopeConversation

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

      {!props.isPending && !props.isError && props.conversations.length > 0 ? (
        <ConversationList
          conversations={props.conversations}
          activeConversationId={props.activeConversationId}
          campaignId={props.campaignId}
        />
      ) : null}
    </>
  )
}
