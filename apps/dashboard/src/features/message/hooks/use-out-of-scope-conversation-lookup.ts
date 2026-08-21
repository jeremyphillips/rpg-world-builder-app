import type { Conversation } from '@rpg/contracts'

import { useConversation } from './use-conversation'
import { useConversations } from './use-conversations'

export function useOutOfScopeConversationLookup(
  activeConversationId: string | undefined,
  campaignId: string | undefined,
) {
  const { data, isPending, isError } = useConversations(campaignId)
  const conversationInScopedList = data?.items.some((item) => item.id === activeConversationId)
  const { data: unscopedData } = useConversations(undefined, {
    enabled: Boolean(campaignId && activeConversationId && data && !conversationInScopedList),
  })
  const conversationInUnscopedList = unscopedData?.items.some(
    (item) => item.id === activeConversationId,
  )
  const needsConversationLookup = Boolean(
    campaignId &&
    activeConversationId &&
    data &&
    !conversationInScopedList &&
    unscopedData &&
    !conversationInUnscopedList,
  )
  const { data: lookedUpConversation, isError: isConversationLookupError } = useConversation(
    activeConversationId,
    { enabled: needsConversationLookup },
  )

  return {
    data,
    isPending,
    isError,
    unscopedData,
    lookedUpConversation,
    isConversationLookupError,
  }
}

export function resolveOutOfScopeConversationFromLookup(input: {
  campaignId?: string
  activeConversationId?: string
  scopedConversations: Conversation[]
  unscopedConversations?: Conversation[]
  lookedUpConversation?: Conversation | null
}): Conversation | null {
  if (!input.campaignId || !input.activeConversationId) return null

  const inScopedList = input.scopedConversations.some(
    (item) => item.id === input.activeConversationId,
  )
  if (inScopedList) return null

  return (
    input.unscopedConversations?.find((item) => item.id === input.activeConversationId) ??
    input.lookedUpConversation ??
    null
  )
}
