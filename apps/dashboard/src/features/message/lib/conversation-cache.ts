import type { InfiniteData } from '@tanstack/react-query'
import type {
  Conversation,
  ConversationListResponse,
  DirectMessage,
  MessageListResponse,
} from '@rpg/contracts'

export type ConversationActivityPayload = {
  conversation: Conversation
  message?: DirectMessage
  version: number
}

function compareConversationsNewestFirst(left: Conversation, right: Conversation): number {
  const leftSortAt = left.latestMessage?.createdAt ?? left.updatedAt
  const rightSortAt = right.latestMessage?.createdAt ?? right.updatedAt
  const createdAtCompare = rightSortAt.localeCompare(leftSortAt)
  if (createdAtCompare !== 0) return createdAtCompare
  return right.id.localeCompare(left.id)
}

function shouldApplyConversationVersion(
  cached: Conversation | undefined,
  incomingVersion: number,
): boolean {
  if (!cached) return true
  return incomingVersion >= cached.version
}

function messageExistsInPage(items: DirectMessage[], message: DirectMessage): boolean {
  return items.some(
    (item) =>
      item.id === message.id ||
      (message.clientMessageId !== undefined && item.clientMessageId === message.clientMessageId),
  )
}

/** Applies a recipient-specific conversation envelope to the list cache. */
export function applyConversationEnvelopeToList(
  current: ConversationListResponse | undefined,
  payload: ConversationActivityPayload,
): ConversationListResponse | undefined {
  if (!current) return current

  const existing = current.items.find((item) => item.id === payload.conversation.id)
  if (!shouldApplyConversationVersion(existing, payload.version)) {
    return current
  }

  const withoutExisting = current.items.filter((item) => item.id !== payload.conversation.id)
  const items = [payload.conversation, ...withoutExisting].sort(compareConversationsNewestFirst)

  return {
    ...current,
    items,
  }
}

/** Upserts a message into the active thread cache (newest-first API pages). */
export function applyConversationEnvelopeToThread(
  current: InfiniteData<MessageListResponse> | undefined,
  payload: ConversationActivityPayload,
): InfiniteData<MessageListResponse> | undefined {
  if (!current || !payload.message) return current

  const pages = current.pages.map((page, pageIndex) => {
    if (messageExistsInPage(page.items, payload.message!)) {
      return {
        ...page,
        items: page.items.map((item) =>
          item.id === payload.message!.id ||
          (payload.message!.clientMessageId !== undefined &&
            item.clientMessageId === payload.message!.clientMessageId)
            ? payload.message!
            : item,
        ),
      }
    }

    if (pageIndex === 0) {
      return {
        ...page,
        items: [payload.message!, ...page.items],
      }
    }

    return page
  })

  return { ...current, pages }
}

/** Applies envelope to list cache; thread cache only when a message is present. */
export function applyConversationEnvelope(
  currentList: ConversationListResponse | undefined,
  payload: ConversationActivityPayload,
): ConversationListResponse | undefined {
  return applyConversationEnvelopeToList(currentList, payload)
}
