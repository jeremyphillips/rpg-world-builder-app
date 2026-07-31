import type { DirectMessage } from '@rpg/contracts'

import type { MessageSchemaType } from './message.model'

type MessageRecord = MessageSchemaType & {
  _id: unknown
  createdAt: Date
}

export function toMessage(doc: MessageRecord): DirectMessage {
  return {
    id: String(doc._id),
    conversationId: doc.conversationId,
    senderUserId: doc.senderUserId,
    content: {
      kind: 'text',
      text: doc.content.text,
    },
    ...(doc.clientMessageId ? { clientMessageId: doc.clientMessageId } : {}),
    editedAt: doc.editedAt ? doc.editedAt.toISOString() : null,
    deletedAt: doc.deletedAt ? doc.deletedAt.toISOString() : null,
    createdAt: doc.createdAt.toISOString(),
  }
}
