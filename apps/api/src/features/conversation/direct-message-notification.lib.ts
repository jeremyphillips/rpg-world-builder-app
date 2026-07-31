import { findSessionUserById } from '../user'
import { directMessageDedupeKey, publishNotification } from '../notification'
import { buildMessagePreview } from './build-message-preview.lib'

export async function publishDirectMessageReceivedNotification(input: {
  conversationId: string
  recipientUserId: string
  messageId: string
  senderUserId: string
  text: string
  unreadMessageCount: number
}): Promise<void> {
  const sender = await findSessionUserById(input.senderUserId)
  const senderDisplayName = sender?.displayName?.trim() || 'Unknown user'

  await publishNotification({
    type: 'message.direct.received',
    recipientUserIds: [input.recipientUserId],
    dedupeKey: directMessageDedupeKey(input.conversationId),
    payload: {
      conversationId: input.conversationId,
      messageId: input.messageId,
      senderDisplayName,
      preview: buildMessagePreview(input.text),
      unreadMessageCount: input.unreadMessageCount,
    },
  })
}
