import type {
  Conversation,
  ConversationListResponse,
  DirectConversationRecipientsResponse,
  MarkConversationReadResponse,
  MessageListResponse,
  SendDirectMessageInput,
  SendDirectMessageResponse,
} from '@rpg/contracts'

import { patchJson, postJson, request } from '@/lib/api-client'

const CONVERSATIONS_API_PATH = '/api/conversations'

export async function listConversationRecipients(
  options: { campaignId?: string } = {},
): Promise<DirectConversationRecipientsResponse> {
  const params = new URLSearchParams()
  if (options.campaignId) params.set('campaignId', options.campaignId)

  const query = params.toString()
  const path = query
    ? `${CONVERSATIONS_API_PATH}/direct/recipients?${query}`
    : `${CONVERSATIONS_API_PATH}/direct/recipients`

  return request<DirectConversationRecipientsResponse>(
    path,
    undefined,
    'Could not load message recipients.',
  )
}

export async function createDirectConversation(
  recipientUserId: string,
): Promise<{ conversation: Conversation }> {
  return postJson<{ conversation: Conversation }>(
    `${CONVERSATIONS_API_PATH}/direct`,
    { recipientUserId },
    'Could not start conversation.',
  )
}

export async function listConversations(
  options: { limit?: number; cursor?: string; campaignId?: string } = {},
): Promise<ConversationListResponse> {
  const params = new URLSearchParams()
  if (options.limit) params.set('limit', String(options.limit))
  if (options.cursor) params.set('cursor', options.cursor)
  if (options.campaignId) params.set('campaignId', options.campaignId)

  const query = params.toString()
  const path = query ? `${CONVERSATIONS_API_PATH}?${query}` : CONVERSATIONS_API_PATH

  return request<ConversationListResponse>(path, undefined, 'Could not load conversations.')
}

export async function listConversationMessages(
  conversationId: string,
  options: { limit?: number; cursor?: string } = {},
): Promise<MessageListResponse> {
  const params = new URLSearchParams()
  if (options.limit) params.set('limit', String(options.limit))
  if (options.cursor) params.set('cursor', options.cursor)

  const query = params.toString()
  const path = query
    ? `${CONVERSATIONS_API_PATH}/${conversationId}/messages?${query}`
    : `${CONVERSATIONS_API_PATH}/${conversationId}/messages`

  return request<MessageListResponse>(path, undefined, 'Could not load messages.')
}

export async function sendConversationMessage(
  conversationId: string,
  input: SendDirectMessageInput,
): Promise<SendDirectMessageResponse> {
  return postJson<SendDirectMessageResponse>(
    `${CONVERSATIONS_API_PATH}/${conversationId}/messages`,
    input,
    'Could not send message.',
  )
}

export async function markConversationRead(
  conversationId: string,
  input: { lastReadMessageId?: string } = {},
): Promise<MarkConversationReadResponse> {
  return patchJson<MarkConversationReadResponse>(
    `${CONVERSATIONS_API_PATH}/${conversationId}/read`,
    input,
    'Could not mark conversation as read.',
  )
}
