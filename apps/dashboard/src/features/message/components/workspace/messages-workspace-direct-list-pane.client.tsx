'use client'

/**
 * Parent: MessagesWorkspaceShell (left column on list routes)
 * Route context: direct conversation list with optional campaign scope
 */
import type { ConversationListScope } from '@rpg/contracts'

import { MessagesDirectListContent } from '../direct-list/messages-direct-list-content.client'
import { useOutOfScopeConversationLookup } from '../../hooks/use-out-of-scope-conversation-lookup'

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
