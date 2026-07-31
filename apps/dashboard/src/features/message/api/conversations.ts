import type {
  ConversationListResponse,
  DirectConversationRecipientsResponse,
  GetConversationResponse,
  MarkConversationReadResponse,
  MessageListResponse,
  SendDirectMessageInput,
  SendDirectMessageResponse,
  SendFirstDirectMessageInput,
  SendFirstDirectMessageResponse,
} from '@rpg/contracts'

import { patchJson, postJson, request } from '@/lib/api-client'

import { MESSAGES_ERROR_COPY } from '../lib/messages-copy'

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
    MESSAGES_ERROR_COPY.loadMessageRecipients,
  )
}

export async function sendFirstDirectMessage(
  input: SendFirstDirectMessageInput,
): Promise<SendFirstDirectMessageResponse> {
  return postJson<SendFirstDirectMessageResponse>(
    `${CONVERSATIONS_API_PATH}/direct/messages`,
    input,
    MESSAGES_ERROR_COPY.sendMessage,
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

  return request<ConversationListResponse>(path, undefined, MESSAGES_ERROR_COPY.loadConversations)
}

export async function getConversation(conversationId: string): Promise<GetConversationResponse> {
  return request<GetConversationResponse>(
    `${CONVERSATIONS_API_PATH}/${conversationId}`,
    undefined,
    MESSAGES_ERROR_COPY.loadConversations,
  )
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

  return request<MessageListResponse>(path, undefined, MESSAGES_ERROR_COPY.loadMessages)
}

export async function sendConversationMessage(
  conversationId: string,
  input: SendDirectMessageInput,
): Promise<SendDirectMessageResponse> {
  return postJson<SendDirectMessageResponse>(
    `${CONVERSATIONS_API_PATH}/${conversationId}/messages`,
    input,
    MESSAGES_ERROR_COPY.sendMessage,
  )
}

export async function markConversationRead(
  conversationId: string,
  input: { lastReadMessageId?: string } = {},
): Promise<MarkConversationReadResponse> {
  return patchJson<MarkConversationReadResponse>(
    `${CONVERSATIONS_API_PATH}/${conversationId}/read`,
    input,
    MESSAGES_ERROR_COPY.markConversationRead,
  )
}
