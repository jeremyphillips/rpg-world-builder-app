import type { Conversation } from '@rpg/contracts'

import type { ConversationSchemaType } from './conversation.model'

type ConversationRecord = ConversationSchemaType & {
  _id: unknown
  createdAt: Date
  updatedAt: Date
  latestMessage?: {
    messageId: string
    senderUserId: string
    preview: string
    createdAt: Date
  } | null
}

export function toConversation(
  doc: ConversationRecord,
  {
    peer,
    unreadCount,
  }: {
    peer: { userId: string; displayName: string }
    unreadCount: number
  },
): Conversation {
  return {
    id: String(doc._id),
    kind: 'direct',
    participantUserIds: [doc.participantUserIds[0]!, doc.participantUserIds[1]!],
    peer,
    ...(doc.latestMessage
      ? {
          latestMessage: {
            messageId: doc.latestMessage.messageId,
            senderUserId: doc.latestMessage.senderUserId,
            preview: doc.latestMessage.preview,
            createdAt: doc.latestMessage.createdAt.toISOString(),
          },
        }
      : {}),
    unreadCount,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  }
}
