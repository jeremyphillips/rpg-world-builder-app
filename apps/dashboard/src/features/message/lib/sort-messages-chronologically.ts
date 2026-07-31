import type { DirectMessage } from '@rpg/contracts'

/** API returns newest-first pages; thread UI renders oldest-first. */
export function sortMessagesChronologically(messages: DirectMessage[]): DirectMessage[] {
  return [...messages].sort((left, right) => {
    const createdAtDelta = new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()
    if (createdAtDelta !== 0) return createdAtDelta
    return left.id.localeCompare(right.id)
  })
}

export function flattenConversationMessages(
  pages: Array<{ items: DirectMessage[] }> | undefined,
): DirectMessage[] {
  if (!pages) return []
  return sortMessagesChronologically(pages.flatMap((page) => page.items))
}
