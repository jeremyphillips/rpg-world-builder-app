import type { Conversation, ConversationListScope } from '@rpg/contracts'

export function resolveOutOfScopeConversation(input: {
  campaignId?: string
  scope?: ConversationListScope
  activeConversationId?: string
  scopedConversations: Conversation[]
  unscopedConversations?: Conversation[]
  lookedUpConversation?: Conversation | null
}): Conversation | null {
  if (!input.campaignId || !input.scope || !input.activeConversationId) {
    return null
  }

  const inScopedList = input.scopedConversations.some(
    (item) => item.id === input.activeConversationId,
  )
  if (inScopedList) {
    return null
  }

  return (
    input.unscopedConversations?.find((item) => item.id === input.activeConversationId) ??
    input.lookedUpConversation ??
    null
  )
}

export function isScopedConversationListEmpty(input: {
  campaignId?: string
  isPending: boolean
  isError: boolean
  conversationCount: number
}): boolean {
  return Boolean(
    input.campaignId && !input.isPending && !input.isError && input.conversationCount === 0,
  )
}
