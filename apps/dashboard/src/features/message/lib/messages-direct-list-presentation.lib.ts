import type { ConversationListScope } from '@rpg/contracts'

export function shouldShowLoadedScopeHint(input: {
  scope?: ConversationListScope
  hasMoreConversations: boolean
  scopedCount?: number
  loadedCount: number
}): boolean {
  return (
    Boolean(input.scope) &&
    input.hasMoreConversations &&
    input.scopedCount !== undefined &&
    input.loadedCount < input.scopedCount
  )
}

export function resolveDirectListVisibility(input: {
  isPending: boolean
  isError: boolean
  conversationCount: number
  hasOutOfScopeConversation: boolean
}): { showEmptyState: boolean; showConversationList: boolean } {
  const hasLoadedConversations = input.conversationCount > 0
  const isReady = !input.isPending && !input.isError

  return {
    showEmptyState: isReady && !hasLoadedConversations && !input.hasOutOfScopeConversation,
    showConversationList: isReady && hasLoadedConversations,
  }
}

export type DirectListScopeHintInput = {
  loadedCount: number
  scopedCount: number
}

/** Scope utility counts come from API metadata, not the loaded page length. */
export function usesFullDatasetScopeCounts(input: {
  scopedCount: number
  hiddenCount: number
  loadedCount: number
}): boolean {
  return input.scopedCount !== input.loadedCount || input.hiddenCount > 0
}
