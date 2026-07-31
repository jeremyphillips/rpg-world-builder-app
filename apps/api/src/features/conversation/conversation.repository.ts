import type { Conversation, DirectMessage } from '@rpg/contracts'
import { isValidObjectId, Types, type ClientSession } from 'mongoose'

import { buildMessagePreview } from './build-message-preview.lib'
import {
  buildDirectConversationParticipantIds,
  buildDirectConversationParticipantKey,
} from './conversation-participant-key.lib'
import { ConversationParticipantStateModel } from './conversation-participant-state.model'
import { ConversationModel } from './conversation.model'
import { MessageModel } from './message.model'
import { findUsersByIds } from '../user'
import { toConversation } from './to-conversation'
import { toMessage } from './to-message'
import {
  assembleConversationResponse,
  assembleConversationResponses,
} from './assemble-conversation-response.lib'
import type { BaseConversation } from './to-conversation'
import { areMongoTransactionsEnabled, runInTransaction } from '../../lib/mongo-transaction'

type ConversationRecord = Parameters<typeof toConversation>[0]
type MessageRecord = Parameters<typeof toMessage>[0]

function isMongoDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code: number }).code === 11000
  )
}

export function encodeMessageCursor(createdAt: Date, id: string): string {
  return `${createdAt.toISOString()}|${id}`
}

export function decodeMessageCursor(cursor: string): { createdAt: Date; id: string } | null {
  const separatorIndex = cursor.indexOf('|')
  if (separatorIndex <= 0) return null

  const iso = cursor.slice(0, separatorIndex)
  const id = cursor.slice(separatorIndex + 1)
  if (!id) return null

  const createdAt = new Date(iso)
  if (Number.isNaN(createdAt.getTime())) return null

  return { createdAt, id }
}

export function encodeConversationCursor(sortAt: Date, id: string): string {
  return `${sortAt.toISOString()}|${id}`
}

export function decodeConversationCursor(cursor: string): { sortAt: Date; id: string } | null {
  const separatorIndex = cursor.indexOf('|')
  if (separatorIndex <= 0) return null

  const iso = cursor.slice(0, separatorIndex)
  const id = cursor.slice(separatorIndex + 1)
  if (!id) return null

  const sortAt = new Date(iso)
  if (Number.isNaN(sortAt.getTime())) return null

  return { sortAt, id }
}

async function ensureParticipantStates(
  conversationId: string,
  participantUserIds: string[],
  session?: ClientSession,
) {
  await Promise.all(
    participantUserIds.map((userId) =>
      ConversationParticipantStateModel.updateOne(
        { conversationId, userId },
        {
          $setOnInsert: {
            conversationId,
            userId,
            lastReadMessageId: null,
            lastReadAt: null,
          },
        },
        { upsert: true, session: session ?? undefined },
      ),
    ),
  )
}

async function countUnreadMessagesForParticipant({
  conversationId,
  viewerUserId,
  lastReadMessageId,
  session,
}: {
  conversationId: string
  viewerUserId: string
  lastReadMessageId?: string | null
  session?: ClientSession
}): Promise<number> {
  const baseFilter = {
    conversationId,
    senderUserId: { $ne: viewerUserId },
    deletedAt: null,
  }

  if (!lastReadMessageId || !isValidObjectId(lastReadMessageId)) {
    return MessageModel.countDocuments(baseFilter).session(session ?? null)
  }

  const lastRead = await MessageModel.findById(lastReadMessageId)
    .select('createdAt')
    .session(session ?? null)
    .lean<{ createdAt: Date; _id: Types.ObjectId } | null>()

  if (!lastRead) {
    return MessageModel.countDocuments(baseFilter).session(session ?? null)
  }

  return MessageModel.countDocuments({
    ...baseFilter,
    $or: [
      { createdAt: { $gt: lastRead.createdAt } },
      {
        createdAt: lastRead.createdAt,
        _id: { $gt: lastRead._id },
      },
    ],
  }).session(session ?? null)
}

async function incrementParticipantStateVersions(
  conversationId: string,
  participantUserIds: string[],
  session?: ClientSession,
): Promise<void> {
  await ConversationParticipantStateModel.updateMany(
    { conversationId, userId: { $in: participantUserIds } },
    { $inc: { version: 1 }, $set: { updatedAt: new Date() } },
    { session: session ?? undefined },
  )
}

export async function buildConversationForParticipant({
  conversationId,
  viewerUserId,
  peer,
}: {
  conversationId: string
  viewerUserId: string
  peer: { userId: string; displayName: string }
}): Promise<Conversation | null> {
  const conversation = await ConversationModel.findOne({
    _id: conversationId,
    participantUserIds: viewerUserId,
  }).lean<ConversationRecord | null>()

  if (!conversation) return null
  return buildConversationDto(conversation, viewerUserId, peer)
}

async function buildBaseConversationDto(
  doc: ConversationRecord,
  viewerUserId: string,
  peer: { userId: string; displayName: string },
): Promise<BaseConversation> {
  const participantState = await ConversationParticipantStateModel.findOne({
    conversationId: String(doc._id),
    userId: viewerUserId,
  })
    .select('lastReadMessageId version')
    .lean<{ lastReadMessageId?: string | null; version: number } | null>()

  const unreadCount = await countUnreadMessagesForParticipant({
    conversationId: String(doc._id),
    viewerUserId,
    lastReadMessageId: participantState?.lastReadMessageId,
  })

  return toConversation(doc, {
    peer,
    unreadCount,
    version: participantState?.version ?? 1,
  })
}

async function buildConversationDto(
  doc: ConversationRecord,
  viewerUserId: string,
  peer: { userId: string; displayName: string },
): Promise<Conversation> {
  const base = await buildBaseConversationDto(doc, viewerUserId, peer)
  return assembleConversationResponse(viewerUserId, base)
}

export async function findOrCreateDirectConversation({
  callerUserId,
  recipientUserId,
  peer,
}: {
  callerUserId: string
  recipientUserId: string
  peer: { userId: string; displayName: string }
}): Promise<Conversation> {
  const participantKey = buildDirectConversationParticipantKey(callerUserId, recipientUserId)
  const participantUserIds = buildDirectConversationParticipantIds(callerUserId, recipientUserId)

  let doc = await ConversationModel.findOne({ participantKey }).lean<ConversationRecord | null>()

  if (!doc) {
    const created = await ConversationModel.create({
      kind: 'direct',
      participantKey,
      participantUserIds,
      latestMessage: null,
    })
    doc = created.toObject() as ConversationRecord
  }

  await ensureParticipantStates(String(doc._id), participantUserIds)
  return buildConversationDto(doc, callerUserId, peer)
}

export async function listAllConversationRecordsForUser(viewerUserId: string): Promise<
  Array<{
    doc: ConversationRecord
    peerUserId: string
    sortAt: Date
  }>
> {
  const docs = await ConversationModel.aggregate<ConversationRecord>([
    {
      $match: {
        participantUserIds: viewerUserId,
        latestMessage: { $ne: null },
      },
    },
    {
      $addFields: {
        sortAt: { $ifNull: ['$latestMessage.createdAt', '$createdAt'] },
      },
    },
    { $sort: { sortAt: -1, _id: -1 } },
  ])

  return docs.flatMap((doc) => {
    const peerUserId = doc.participantUserIds.find((userId) => userId !== viewerUserId)
    if (!peerUserId) return []
    return [
      {
        doc,
        peerUserId,
        sortAt: doc.latestMessage?.createdAt ?? doc.createdAt,
      },
    ]
  })
}

function paginateConversationRecords<T extends { sortAt: Date; doc: ConversationRecord }>(
  records: T[],
  limit: number,
  cursor?: string,
): { page: T[]; hasMore: boolean } {
  const decodedCursor = cursor ? decodeConversationCursor(cursor) : null
  const filtered = decodedCursor
    ? records.filter((record) => {
        const sortAtTime = record.sortAt.getTime()
        const cursorTime = decodedCursor.sortAt.getTime()
        if (sortAtTime < cursorTime) return true
        if (sortAtTime > cursorTime) return false
        return String(record.doc._id) < decodedCursor.id
      })
    : records

  const hasMore = filtered.length > limit
  const page = hasMore ? filtered.slice(0, limit) : filtered
  return { page, hasMore }
}

export async function listConversationsPageFromRecords({
  viewerUserId,
  records,
  limit,
  cursor,
  peerByUserId,
}: {
  viewerUserId: string
  records: Array<{ doc: ConversationRecord; peerUserId: string; sortAt: Date }>
  limit: number
  cursor?: string
  peerByUserId: Map<string, { userId: string; displayName: string }>
}): Promise<{ items: Conversation[]; nextCursor: string | null }> {
  const { page, hasMore } = paginateConversationRecords(records, limit, cursor)
  const last = page.at(-1)

  const peerUserIdsToLoad = page
    .map((record) => record.peerUserId)
    .filter((userId) => Boolean(userId && !peerByUserId.has(userId)))

  if (peerUserIdsToLoad.length > 0) {
    const users = await findUsersByIds(peerUserIdsToLoad)
    for (const user of users) {
      peerByUserId.set(user.id, { userId: user.id, displayName: user.displayName })
    }
  }

  const baseItems = await Promise.all(
    page.map(async (record) => {
      const peer = peerByUserId.get(record.peerUserId) ?? {
        userId: record.peerUserId,
        displayName: 'Unknown user',
      }
      return buildBaseConversationDto(record.doc, viewerUserId, peer)
    }),
  )

  const items = await assembleConversationResponses(viewerUserId, baseItems)

  return {
    items,
    nextCursor:
      hasMore && last ? encodeConversationCursor(last.sortAt, String(last.doc._id)) : null,
  }
}

export async function listConversationsForUser({
  viewerUserId,
  limit,
  cursor,
  peerByUserId,
}: {
  viewerUserId: string
  limit: number
  cursor?: string
  peerByUserId: Map<string, { userId: string; displayName: string }>
}): Promise<{ items: Conversation[]; nextCursor: string | null }> {
  const filter: Record<string, unknown> = {
    participantUserIds: viewerUserId,
    latestMessage: { $ne: null },
  }

  const decodedCursor = cursor ? decodeConversationCursor(cursor) : null
  if (decodedCursor) {
    filter.$or = [
      {
        $expr: {
          $lt: [{ $ifNull: ['$latestMessage.createdAt', '$createdAt'] }, decodedCursor.sortAt],
        },
      },
      {
        $and: [
          {
            $expr: {
              $eq: [{ $ifNull: ['$latestMessage.createdAt', '$createdAt'] }, decodedCursor.sortAt],
            },
          },
          { _id: { $lt: new Types.ObjectId(decodedCursor.id) } },
        ],
      },
    ]
  }

  const docs = await ConversationModel.aggregate<ConversationRecord>([
    { $match: filter },
    {
      $addFields: {
        sortAt: { $ifNull: ['$latestMessage.createdAt', '$createdAt'] },
      },
    },
    { $sort: { sortAt: -1, _id: -1 } },
    { $limit: limit + 1 },
  ])

  const hasMore = docs.length > limit
  const page = hasMore ? docs.slice(0, limit) : docs
  const last = page.at(-1)

  const peerUserIdsToLoad = page
    .map((doc) => doc.participantUserIds.find((userId) => userId !== viewerUserId))
    .filter((userId): userId is string => Boolean(userId && !peerByUserId.has(userId)))

  if (peerUserIdsToLoad.length > 0) {
    const users = await findUsersByIds(peerUserIdsToLoad)
    for (const user of users) {
      peerByUserId.set(user.id, { userId: user.id, displayName: user.displayName })
    }
  }

  const baseItems = await Promise.all(
    page.map(async (doc) => {
      const peerUserId = doc.participantUserIds.find((userId) => userId !== viewerUserId)
      const peer = peerUserId
        ? (peerByUserId.get(peerUserId) ?? { userId: peerUserId, displayName: 'Unknown user' })
        : { userId: '', displayName: 'Unknown user' }
      return buildBaseConversationDto(doc, viewerUserId, peer)
    }),
  )

  const items = await assembleConversationResponses(viewerUserId, baseItems)

  return {
    items,
    nextCursor:
      hasMore && last
        ? encodeConversationCursor(
            last.latestMessage?.createdAt ?? last.createdAt,
            String(last._id),
          )
        : null,
  }
}

export async function listMessagesForConversation({
  conversationId,
  viewerUserId,
  limit,
  cursor,
}: {
  conversationId: string
  viewerUserId: string
  limit: number
  cursor?: string
}): Promise<{ items: DirectMessage[]; nextCursor: string | null }> {
  const conversation = await ConversationModel.findOne({
    _id: conversationId,
    participantUserIds: viewerUserId,
  }).lean()

  if (!conversation) {
    return { items: [], nextCursor: null }
  }

  const filter: Record<string, unknown> = {
    conversationId,
    deletedAt: null,
  }

  const decodedCursor = cursor ? decodeMessageCursor(cursor) : null
  if (decodedCursor) {
    filter.$or = [
      { createdAt: { $lt: decodedCursor.createdAt } },
      {
        createdAt: decodedCursor.createdAt,
        _id: { $lt: new Types.ObjectId(decodedCursor.id) },
      },
    ]
  }

  const docs = await MessageModel.find(filter)
    .sort({ createdAt: -1, _id: -1 })
    .limit(limit + 1)
    .lean<MessageRecord[]>()

  const hasMore = docs.length > limit
  const page = hasMore ? docs.slice(0, limit) : docs
  const last = page.at(-1)

  return {
    items: page.map(toMessage),
    nextCursor: hasMore && last ? encodeMessageCursor(last.createdAt, String(last._id)) : null,
  }
}

export async function sendDirectMessage({
  conversationId,
  senderUserId,
  content,
  clientMessageId,
}: {
  conversationId: string
  senderUserId: string
  content: { kind: 'text'; text: string }
  clientMessageId?: string
}): Promise<{
  message: DirectMessage
  recipientUserId: string
  unreadMessageCount: number
  isNew: boolean
} | null> {
  const conversation = await ConversationModel.findOne({
    _id: conversationId,
    participantUserIds: senderUserId,
  }).lean<ConversationRecord | null>()

  if (!conversation) return null

  if (clientMessageId) {
    const existing = await MessageModel.findOne({
      conversationId,
      senderUserId,
      clientMessageId,
    }).lean<MessageRecord | null>()

    if (existing) {
      const recipientUserId =
        conversation.participantUserIds.find((userId) => userId !== senderUserId) ?? ''
      const unreadMessageCount = recipientUserId
        ? await countUnreadMessagesForParticipant({
            conversationId,
            viewerUserId: recipientUserId,
            lastReadMessageId: (
              await ConversationParticipantStateModel.findOne({
                conversationId,
                userId: recipientUserId,
              })
                .select('lastReadMessageId')
                .lean<{ lastReadMessageId?: string | null } | null>()
            )?.lastReadMessageId,
          })
        : 0

      return {
        message: toMessage(existing),
        recipientUserId,
        unreadMessageCount,
        isNew: false,
      }
    }
  }

  const messageDoc = await MessageModel.create({
    conversationId,
    senderUserId,
    content,
    clientMessageId: clientMessageId ?? null,
    editedAt: null,
    deletedAt: null,
  })

  const preview = buildMessagePreview(content.text)
  const latestMessage = {
    messageId: String(messageDoc._id),
    senderUserId,
    preview,
    createdAt: messageDoc.createdAt,
  }

  await ConversationModel.findOneAndUpdate(
    {
      _id: conversationId,
      $or: [
        { latestMessage: null },
        { latestMessage: { $exists: false } },
        { 'latestMessage.createdAt': { $lt: messageDoc.createdAt } },
        {
          'latestMessage.createdAt': messageDoc.createdAt,
          'latestMessage.messageId': { $lt: String(messageDoc._id) },
        },
      ],
    },
    {
      $set: {
        latestMessage,
        updatedAt: new Date(),
      },
    },
  )

  await incrementParticipantStateVersions(conversationId, conversation.participantUserIds)

  const recipientUserId =
    conversation.participantUserIds.find((userId) => userId !== senderUserId) ?? ''

  const unreadMessageCount = recipientUserId
    ? await countUnreadMessagesForParticipant({
        conversationId,
        viewerUserId: recipientUserId,
        lastReadMessageId: (
          await ConversationParticipantStateModel.findOne({
            conversationId,
            userId: recipientUserId,
          })
            .select('lastReadMessageId')
            .lean<{ lastReadMessageId?: string | null } | null>()
        )?.lastReadMessageId,
      })
    : 0

  return {
    message: toMessage(messageDoc.toObject() as MessageRecord),
    recipientUserId,
    unreadMessageCount,
    isNew: true,
  }
}

type FirstDirectMessageWriteResult = {
  conversation: Conversation
  message: DirectMessage
  recipientUserId: string
  unreadMessageCount: number
  isNew: boolean
}

async function loadRecipientUnreadCount(
  conversationId: string,
  recipientUserId: string,
  session?: ClientSession,
): Promise<number> {
  const participantState = await ConversationParticipantStateModel.findOne({
    conversationId,
    userId: recipientUserId,
  })
    .select('lastReadMessageId')
    .session(session ?? null)
    .lean<{ lastReadMessageId?: string | null } | null>()

  return countUnreadMessagesForParticipant({
    conversationId,
    viewerUserId: recipientUserId,
    lastReadMessageId: participantState?.lastReadMessageId,
    session,
  })
}

async function findExistingFirstDirectMessageRecord({
  callerUserId,
  recipientUserId,
  clientMessageId,
  peer,
  session,
}: {
  callerUserId: string
  recipientUserId: string
  clientMessageId: string
  peer: { userId: string; displayName: string }
  session?: ClientSession
}): Promise<FirstDirectMessageWriteResult | null> {
  const participantKey = buildDirectConversationParticipantKey(callerUserId, recipientUserId)
  const conversation = await ConversationModel.findOne({ participantKey })
    .session(session ?? null)
    .lean<ConversationRecord | null>()

  if (!conversation) return null

  const existing = await MessageModel.findOne({
    conversationId: String(conversation._id),
    senderUserId: callerUserId,
    clientMessageId,
  })
    .session(session ?? null)
    .lean<MessageRecord | null>()

  if (!existing) return null

  const conversationDto = await buildConversationDto(conversation, callerUserId, peer)

  return {
    conversation: conversationDto,
    message: toMessage(existing),
    recipientUserId,
    unreadMessageCount: await loadRecipientUnreadCount(
      String(conversation._id),
      recipientUserId,
      session,
    ),
    isNew: false,
  }
}

async function findOrCreateDirectConversationDoc({
  participantKey,
  participantUserIds,
  session,
}: {
  participantKey: string
  participantUserIds: string[]
  session?: ClientSession
}): Promise<ConversationRecord> {
  const existing = await ConversationModel.findOne({ participantKey })
    .session(session ?? null)
    .lean<ConversationRecord | null>()

  if (existing) return existing

  const payload = {
    kind: 'direct' as const,
    participantKey,
    participantUserIds,
    latestMessage: null,
  }

  try {
    const created = session
      ? await ConversationModel.create([payload], { session })
      : await ConversationModel.create(payload)

    const createdDoc = Array.isArray(created) ? created[0] : created
    if (!createdDoc) {
      throw new Error('Failed to create direct conversation.')
    }

    return createdDoc.toObject() as ConversationRecord
  } catch (error) {
    if (!isMongoDuplicateKeyError(error)) throw error

    const raced = await ConversationModel.findOne({ participantKey })
      .session(session ?? null)
      .lean<ConversationRecord | null>()

    if (!raced) throw error
    return raced
  }
}

async function createDirectMessageDocument({
  conversationId,
  senderUserId,
  content,
  clientMessageId,
  session,
}: {
  conversationId: string
  senderUserId: string
  content: { kind: 'text'; text: string }
  clientMessageId?: string
  session?: ClientSession
}): Promise<MessageRecord> {
  const payload = {
    conversationId,
    senderUserId,
    content,
    clientMessageId: clientMessageId ?? null,
    editedAt: null,
    deletedAt: null,
  }

  const created = session
    ? await MessageModel.create([payload], { session })
    : await MessageModel.create(payload)

  const messageDoc = Array.isArray(created) ? created[0] : created
  if (!messageDoc) {
    throw new Error('Failed to create first direct message.')
  }

  return messageDoc.toObject() as MessageRecord
}

async function casUpdateConversationLatestMessage({
  conversationId,
  messageDoc,
  senderUserId,
  preview,
  session,
}: {
  conversationId: string
  messageDoc: MessageRecord
  senderUserId: string
  preview: string
  session?: ClientSession
}): Promise<void> {
  await ConversationModel.findOneAndUpdate(
    {
      _id: conversationId,
      $or: [
        { latestMessage: null },
        { latestMessage: { $exists: false } },
        { 'latestMessage.createdAt': { $lt: messageDoc.createdAt } },
        {
          'latestMessage.createdAt': messageDoc.createdAt,
          'latestMessage.messageId': { $lt: String(messageDoc._id) },
        },
      ],
    },
    {
      $set: {
        latestMessage: {
          messageId: String(messageDoc._id),
          senderUserId,
          preview,
          createdAt: messageDoc.createdAt,
        },
        updatedAt: new Date(),
      },
    },
    { session: session ?? undefined },
  )
}

async function executeFirstDirectMessageWrites({
  callerUserId,
  recipientUserId,
  content,
  clientMessageId,
  peer,
  session,
}: {
  callerUserId: string
  recipientUserId: string
  content: { kind: 'text'; text: string }
  clientMessageId?: string
  peer: { userId: string; displayName: string }
  session?: ClientSession
}): Promise<FirstDirectMessageWriteResult> {
  const participantKey = buildDirectConversationParticipantKey(callerUserId, recipientUserId)
  const participantUserIds = buildDirectConversationParticipantIds(callerUserId, recipientUserId)

  const doc = await findOrCreateDirectConversationDoc({
    participantKey,
    participantUserIds,
    session,
  })

  const conversationId = String(doc._id)
  await ensureParticipantStates(conversationId, participantUserIds, session)

  const messageDoc = await createDirectMessageDocument({
    conversationId,
    senderUserId: callerUserId,
    content,
    clientMessageId,
    session,
  })

  await casUpdateConversationLatestMessage({
    conversationId,
    messageDoc,
    senderUserId: callerUserId,
    preview: buildMessagePreview(content.text),
    session,
  })

  await incrementParticipantStateVersions(conversationId, participantUserIds, session)

  const updatedConversation = await ConversationModel.findById(conversationId)
    .session(session ?? null)
    .lean<ConversationRecord | null>()

  if (!updatedConversation) {
    throw new Error('Conversation missing after first direct message write.')
  }

  const conversationDto = await buildConversationDto(updatedConversation, callerUserId, peer)

  return {
    conversation: conversationDto,
    message: toMessage(messageDoc),
    recipientUserId,
    unreadMessageCount: await loadRecipientUnreadCount(conversationId, recipientUserId, session),
    isNew: true,
  }
}

/** Removes a conversation row left empty after a failed non-transactional first send. */
export async function compensateEmptyDirectConversation(conversationId: string): Promise<void> {
  const conversation = await ConversationModel.findById(conversationId)
    .select('latestMessage')
    .lean<{ latestMessage?: ConversationRecord['latestMessage'] } | null>()

  if (!conversation || conversation.latestMessage) return

  const messageExists = await MessageModel.exists({ conversationId })
  if (messageExists) return

  await ConversationParticipantStateModel.deleteMany({ conversationId })
  await ConversationModel.deleteOne({ _id: conversationId })
}

export async function sendFirstDirectMessageRecord({
  callerUserId,
  recipientUserId,
  content,
  clientMessageId,
  peer,
}: {
  callerUserId: string
  recipientUserId: string
  content: { kind: 'text'; text: string }
  clientMessageId?: string
  peer: { userId: string; displayName: string }
}): Promise<FirstDirectMessageWriteResult> {
  const write = async (session?: ClientSession) => {
    if (clientMessageId) {
      const existing = await findExistingFirstDirectMessageRecord({
        callerUserId,
        recipientUserId,
        clientMessageId,
        peer,
        session,
      })
      if (existing) return existing
    }

    return executeFirstDirectMessageWrites({
      callerUserId,
      recipientUserId,
      content,
      clientMessageId,
      peer,
      session,
    })
  }

  if (areMongoTransactionsEnabled()) {
    return runInTransaction((session) => write(session))
  }

  const participantKey = buildDirectConversationParticipantKey(callerUserId, recipientUserId)

  try {
    return await write()
  } catch (error) {
    if (isMongoDuplicateKeyError(error)) {
      try {
        return await write()
      } catch (retryError) {
        error = retryError
      }
    }

    const conversation = await ConversationModel.findOne({ participantKey }).select('_id').lean()
    if (conversation) {
      await compensateEmptyDirectConversation(String(conversation._id))
    }
    throw error
  }
}

export async function markConversationRead({
  conversationId,
  viewerUserId,
  lastReadMessageId,
  peer,
}: {
  conversationId: string
  viewerUserId: string
  lastReadMessageId?: string
  peer: { userId: string; displayName: string }
}): Promise<Conversation | null> {
  const conversation = await ConversationModel.findOne({
    _id: conversationId,
    participantUserIds: viewerUserId,
  }).lean<ConversationRecord | null>()

  if (!conversation) return null

  let targetMessageId = lastReadMessageId

  if (!targetMessageId) {
    const latest = await MessageModel.findOne({ conversationId, deletedAt: null })
      .sort({ createdAt: -1, _id: -1 })
      .select('_id')
      .lean<{ _id: Types.ObjectId } | null>()
    targetMessageId = latest ? String(latest._id) : undefined
  }

  if (!targetMessageId || !isValidObjectId(targetMessageId)) {
    return buildConversationDto(conversation, viewerUserId, peer)
  }

  const readMessage = await MessageModel.findOne({
    _id: targetMessageId,
    conversationId,
    deletedAt: null,
  })
    .select('createdAt')
    .lean<{ createdAt: Date } | null>()

  if (!readMessage) return null

  await ConversationParticipantStateModel.updateOne(
    { conversationId, userId: viewerUserId },
    {
      $set: {
        lastReadMessageId: targetMessageId,
        lastReadAt: readMessage.createdAt,
        updatedAt: new Date(),
      },
      $inc: { version: 1 },
      $setOnInsert: {
        conversationId,
        userId: viewerUserId,
      },
    },
    { upsert: true },
  )

  const updatedConversation = await ConversationModel.findById(
    conversationId,
  ).lean<ConversationRecord | null>()
  if (!updatedConversation) return null

  return buildConversationDto(updatedConversation, viewerUserId, peer)
}

export async function getOtherParticipantUserId(
  conversationId: string,
  viewerUserId: string,
): Promise<string | null> {
  const conversation = await ConversationModel.findOne({
    _id: conversationId,
    participantUserIds: viewerUserId,
  })
    .select('participantUserIds')
    .lean<{ participantUserIds: string[] } | null>()

  if (!conversation) return null
  return conversation.participantUserIds.find((userId) => userId !== viewerUserId) ?? null
}

export { countUnreadMessagesForParticipant }
