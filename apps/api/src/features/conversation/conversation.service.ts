import type {
  Conversation,
  ConversationListResponse,
  DirectConversationRecipientsResponse,
  DirectMessage,
  MessageListResponse,
} from '@rpg/contracts'

import { HttpError } from '../../lib/http-error'
import { deliverConversationActivity, deliverNotificationRead } from '../../realtime'
import { findSessionUserById } from '../user'
import { directMessageDedupeKey, markNotificationReadByDedupeKey } from '../notification'
import { getUnreadNotificationCount } from '../notification/notification.service'
import {
  buildConversationForParticipant,
  decodeConversationCursor,
  decodeMessageCursor,
  findOrCreateDirectConversation,
  getOtherParticipantUserId,
  listAllConversationRecordsForUser,
  listConversationsForUser,
  listConversationsPageFromRecords,
  listMessagesForConversation,
  markConversationRead as markConversationReadRecord,
  sendDirectMessage,
} from './conversation.repository'
import {
  isPeerEligibleInCampaignScope,
  resolveConversationCampaignScope,
} from './conversation-campaign-scope.lib'
import { publishDirectMessageReceivedNotification } from './direct-message-notification.lib'
import {
  isEligibleDirectMessageRecipient,
  listDirectMessageRecipients,
} from './direct-message-recipients.service'

async function loadPeerForConversation(
  conversationId: string,
  viewerUserId: string,
): Promise<{ userId: string; displayName: string } | null> {
  const peerUserId = await getOtherParticipantUserId(conversationId, viewerUserId)
  if (!peerUserId) return null

  const peer = await findSessionUserById(peerUserId)
  return {
    userId: peerUserId,
    displayName: peer?.displayName?.trim() || 'Unknown user',
  }
}

async function deliverConversationActivityToParticipants(input: {
  conversationId: string
  participantUserIds: string[]
  message?: DirectMessage
}): Promise<void> {
  await Promise.all(
    input.participantUserIds.map(async (userId) => {
      const peer = await loadPeerForConversation(input.conversationId, userId)
      if (!peer) return

      const conversation = await buildConversationForParticipant({
        conversationId: input.conversationId,
        viewerUserId: userId,
        peer,
      })
      if (!conversation) return

      deliverConversationActivity({
        userId,
        conversation,
        message: input.message,
      })
    }),
  )
}

export async function getDirectMessageRecipients(
  callerUserId: string,
  options: { campaignId?: string } = {},
): Promise<DirectConversationRecipientsResponse> {
  return listDirectMessageRecipients(callerUserId, options)
}

export async function createDirectConversation(
  callerUserId: string,
  recipientUserId: string,
): Promise<Conversation> {
  const eligible = await isEligibleDirectMessageRecipient(callerUserId, recipientUserId)
  if (!eligible) {
    throw HttpError.forbidden('Recipient is not eligible for direct messages.')
  }

  const recipient = await findSessionUserById(recipientUserId)
  if (!recipient) {
    throw new HttpError(404, 'not_found', 'Recipient not found.')
  }

  return findOrCreateDirectConversation({
    callerUserId,
    recipientUserId,
    peer: { userId: recipientUserId, displayName: recipient.displayName },
  })
}

export async function listConversations(
  viewerUserId: string,
  options: { limit: number; cursor?: string; campaignId?: string },
): Promise<ConversationListResponse> {
  if (options.cursor) {
    const decoded = decodeConversationCursor(options.cursor)
    if (!decoded) {
      throw HttpError.badRequest('Validation failed', {
        issues: [{ path: 'cursor', message: 'Invalid cursor.' }],
      })
    }
  }

  if (!options.campaignId) {
    return listConversationsForUser({
      viewerUserId,
      limit: options.limit,
      cursor: options.cursor,
      peerByUserId: new Map(),
    })
  }

  const resolvedScope = await resolveConversationCampaignScope(viewerUserId, options.campaignId)

  if (resolvedScope.scopeInvalid) {
    const unscoped = await listConversationsForUser({
      viewerUserId,
      limit: options.limit,
      cursor: options.cursor,
      peerByUserId: new Map(),
    })
    return {
      ...unscoped,
      scopeInvalid: true,
    }
  }

  const allRecords = await listAllConversationRecordsForUser(viewerUserId)
  const totalCount = allRecords.length
  const scopedRecords = allRecords.filter((record) =>
    isPeerEligibleInCampaignScope(resolvedScope.bundle!, record.peerUserId),
  )
  const scopedCount = scopedRecords.length
  const hiddenCount = totalCount - scopedCount

  const page = await listConversationsPageFromRecords({
    viewerUserId,
    records: scopedRecords,
    limit: options.limit,
    cursor: options.cursor,
    peerByUserId: new Map(),
  })

  return {
    ...page,
    totalCount,
    scopedCount,
    hiddenCount,
    scope: resolvedScope.scope ?? undefined,
  }
}

export async function listConversationMessages(
  viewerUserId: string,
  conversationId: string,
  options: { limit: number; cursor?: string },
): Promise<MessageListResponse> {
  if (options.cursor) {
    const decoded = decodeMessageCursor(options.cursor)
    if (!decoded) {
      throw HttpError.badRequest('Validation failed', {
        issues: [{ path: 'cursor', message: 'Invalid cursor.' }],
      })
    }
  }

  const peerUserId = await getOtherParticipantUserId(conversationId, viewerUserId)
  if (!peerUserId) {
    throw new HttpError(404, 'not_found', 'Conversation not found.')
  }

  return listMessagesForConversation({
    conversationId,
    viewerUserId,
    limit: options.limit,
    cursor: options.cursor,
  })
}

export async function sendConversationMessage(
  viewerUserId: string,
  conversationId: string,
  input: { content: { kind: 'text'; text: string }; clientMessageId?: string },
): Promise<DirectMessage> {
  const peerUserId = await getOtherParticipantUserId(conversationId, viewerUserId)
  if (!peerUserId) {
    throw new HttpError(404, 'not_found', 'Conversation not found.')
  }

  const eligible = await isEligibleDirectMessageRecipient(viewerUserId, peerUserId)
  if (!eligible) {
    throw HttpError.forbidden('Recipient is not eligible for direct messages.')
  }

  const result = await sendDirectMessage({
    conversationId,
    senderUserId: viewerUserId,
    content: input.content,
    clientMessageId: input.clientMessageId,
  })

  if (!result) {
    throw new HttpError(404, 'not_found', 'Conversation not found.')
  }

  if (result.isNew && result.recipientUserId && result.unreadMessageCount > 0) {
    try {
      await publishDirectMessageReceivedNotification({
        conversationId,
        recipientUserId: result.recipientUserId,
        messageId: result.message.id,
        senderUserId: viewerUserId,
        text: input.content.text,
        unreadMessageCount: result.unreadMessageCount,
      })
    } catch (error) {
      console.error('Failed to publish direct message notification.', error)
    }
  }

  if (result.isNew) {
    try {
      await deliverConversationActivityToParticipants({
        conversationId,
        participantUserIds: [viewerUserId, result.recipientUserId].filter(Boolean),
        message: result.message,
      })
    } catch (error) {
      console.error('Failed to deliver conversation activity over realtime.', error)
    }
  }

  return result.message
}

export async function markConversationRead(
  viewerUserId: string,
  conversationId: string,
  lastReadMessageId?: string,
): Promise<Conversation> {
  const peer = await loadPeerForConversation(conversationId, viewerUserId)
  if (!peer) {
    throw new HttpError(404, 'not_found', 'Conversation not found.')
  }

  const conversation = await markConversationReadRecord({
    conversationId,
    viewerUserId,
    lastReadMessageId,
    peer,
  })

  if (!conversation) {
    throw new HttpError(404, 'not_found', 'Conversation not found.')
  }

  try {
    const syncedNotification = await markNotificationReadByDedupeKey({
      recipientUserId: viewerUserId,
      dedupeKey: directMessageDedupeKey(conversationId),
    })
    if (syncedNotification) {
      const unreadCount = await getUnreadNotificationCount(viewerUserId)
      deliverNotificationRead({
        userId: viewerUserId,
        notification: syncedNotification,
        unreadCount,
        version: syncedNotification.version,
      })
    }
  } catch (error) {
    console.error('Failed to sync direct message notification read state.', error)
  }

  try {
    await deliverConversationActivity({
      userId: viewerUserId,
      conversation,
    })
  } catch (error) {
    console.error('Failed to deliver conversation read activity over realtime.', error)
  }

  return conversation
}
