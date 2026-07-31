export const conversationsQueryKey = ['conversations', 'list'] as const

export type ConversationsListQueryOptions = {
  limit: number
  campaignId?: string
}

export const conversationsListQueryKey = (options: ConversationsListQueryOptions) =>
  [...conversationsQueryKey, options] as const

export type ConversationRecipientsQueryOptions = {
  campaignId?: string
}

export const conversationRecipientsQueryKey = (options: ConversationRecipientsQueryOptions = {}) =>
  ['conversations', 'recipients', options] as const

export const conversationMessagesQueryKey = (conversationId: string) =>
  ['conversations', conversationId, 'messages'] as const
