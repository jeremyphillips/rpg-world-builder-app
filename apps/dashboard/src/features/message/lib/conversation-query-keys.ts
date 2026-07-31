export const conversationsQueryKey = ['conversations', 'list'] as const

export const conversationsListQueryKey = (limit: number) =>
  [...conversationsQueryKey, { limit }] as const

export const conversationRecipientsQueryKey = ['conversations', 'recipients'] as const

export const conversationMessagesQueryKey = (conversationId: string) =>
  ['conversations', conversationId, 'messages'] as const
