import { isValidObjectId, Types } from 'mongoose'

import type { NotificationAction, NotificationCategory, NotificationType } from '@rpg/contracts'
import { getNotificationTypesForCategory } from '@rpg/contracts'

import { NotificationModel } from './notification.model'
import { toNotification } from './to-notification'
import type { NotificationPreviewSnapshot } from './notification.registry'

type NotificationRecord = Parameters<typeof toNotification>[0]

export type UpsertNotificationInput = {
  recipientUserId: string
  type: NotificationType
  payload: unknown
  preview: NotificationPreviewSnapshot
  dedupeKey?: string
  resetReadState: boolean
}

export function encodeNotificationCursor(createdAt: Date, id: string): string {
  return `${createdAt.toISOString()}|${id}`
}

export function decodeNotificationCursor(cursor: string): { createdAt: Date; id: string } | null {
  const separatorIndex = cursor.indexOf('|')
  if (separatorIndex <= 0) return null

  const iso = cursor.slice(0, separatorIndex)
  const id = cursor.slice(separatorIndex + 1)
  if (!id) return null

  const createdAt = new Date(iso)
  if (Number.isNaN(createdAt.getTime())) return null

  return { createdAt, id }
}

function actionsEqual(
  left: NotificationAction | undefined,
  right: NotificationAction | undefined,
): boolean {
  if (!left && !right) return true
  if (!left || !right) return false
  return left.kind === right.kind && JSON.stringify(left) === JSON.stringify(right)
}

export function previewMateriallyChanged(
  existing: {
    title: string
    description?: string | null
    action?: NotificationAction | null
  },
  next: NotificationPreviewSnapshot,
): boolean {
  if (existing.title !== next.title) return true
  if ((existing.description ?? '') !== (next.description ?? '')) return true
  return !actionsEqual(existing.action ?? undefined, next.action)
}

export async function upsertNotificationRecord(
  input: UpsertNotificationInput,
): Promise<ReturnType<typeof toNotification>> {
  const now = new Date()
  const baseUpdate = {
    type: input.type,
    title: input.preview.title,
    description: input.preview.description ?? null,
    actorLabel: input.preview.actorLabel ?? null,
    subjectLabel: input.preview.subjectLabel ?? null,
    payload: input.payload,
    action: input.preview.action ?? null,
    dedupeKey: input.dedupeKey ?? null,
    createdAt: now,
    updatedAt: now,
    ...(input.resetReadState ? { readAt: null, seenAt: null } : {}),
  }
  const versionIncrement = { $inc: { version: 1 } }

  if (input.dedupeKey) {
    const existing = await NotificationModel.findOne({
      recipientUserId: input.recipientUserId,
      dedupeKey: input.dedupeKey,
    }).lean<NotificationRecord | null>()

    if (existing) {
      const doc = await NotificationModel.findOneAndUpdate(
        { _id: existing._id },
        { $set: baseUpdate, ...versionIncrement },
        { new: true, returnDocument: 'after' },
      ).lean<NotificationRecord | null>()

      if (!doc) {
        throw new Error('Notification disappeared during dedupe upsert.')
      }

      return toNotification(doc)
    }
  }

  const doc = await NotificationModel.create({
    recipientUserId: input.recipientUserId,
    ...baseUpdate,
    readAt: null,
    seenAt: null,
    archivedAt: null,
  })

  return toNotification(doc.toObject() as NotificationRecord)
}

export async function listNotificationsForRecipient({
  recipientUserId,
  limit,
  cursor,
  unread,
  category,
  campaignId,
}: {
  recipientUserId: string
  limit: number
  cursor?: string
  unread?: boolean
  category?: NotificationCategory
  campaignId?: string
}): Promise<{
  items: ReturnType<typeof toNotification>[]
  nextCursor: string | null
}> {
  const filter: Record<string, unknown> = {
    recipientUserId,
    // Phase 1: archived rows are excluded; nothing writes archivedAt yet.
    archivedAt: null,
  }

  if (unread === true) {
    filter.readAt = null
  }

  if (category) {
    filter.type = { $in: getNotificationTypesForCategory(category) }
  }

  if (campaignId) {
    filter.$or = [{ 'action.campaignId': campaignId }, { 'payload.campaignId': campaignId }]
  }

  const decodedCursor = cursor ? decodeNotificationCursor(cursor) : null
  if (decodedCursor) {
    const cursorClause = {
      $or: [
        { createdAt: { $lt: decodedCursor.createdAt } },
        {
          createdAt: decodedCursor.createdAt,
          _id: { $lt: new Types.ObjectId(decodedCursor.id) },
        },
      ],
    }

    if (filter.$or) {
      filter.$and = [{ $or: filter.$or }, cursorClause]
      delete filter.$or
    } else {
      Object.assign(filter, cursorClause)
    }
  }

  const docs = await NotificationModel.find(filter)
    .sort({ createdAt: -1, _id: -1 })
    .limit(limit + 1)
    .lean<NotificationRecord[]>()

  const hasMore = docs.length > limit
  const page = hasMore ? docs.slice(0, limit) : docs
  const last = page.at(-1)

  return {
    items: page.map(toNotification),
    // Phase 1: returned for API consumers; dashboard polls only the first page.
    nextCursor: hasMore && last ? encodeNotificationCursor(last.createdAt, String(last._id)) : null,
  }
}

export async function countUnreadNotifications(recipientUserId: string): Promise<number> {
  return NotificationModel.countDocuments({
    recipientUserId,
    archivedAt: null,
    readAt: null,
  })
}

export async function markNotificationRead({
  recipientUserId,
  notificationId,
}: {
  recipientUserId: string
  notificationId: string
}): Promise<ReturnType<typeof toNotification> | null> {
  if (!isValidObjectId(notificationId)) return null

  const now = new Date()
  const doc = await NotificationModel.findOneAndUpdate(
    {
      _id: notificationId,
      recipientUserId,
      archivedAt: null,
    },
    {
      $set: {
        readAt: now,
        seenAt: now,
        updatedAt: now,
      },
      $inc: { version: 1 },
    },
    { new: true, returnDocument: 'after' },
  ).lean<NotificationRecord | null>()

  if (!doc) return null
  return toNotification(doc)
}

export async function markAllNotificationsRead(recipientUserId: string): Promise<{
  updatedCount: number
  notificationIds: string[]
  version: number
}> {
  const unreadDocs = await NotificationModel.find({
    recipientUserId,
    archivedAt: null,
    readAt: null,
  })
    .select('_id')
    .lean<Array<{ _id: unknown }>>()

  const notificationIds = unreadDocs.map((doc) => String(doc._id))
  const version = Date.now()
  const now = new Date()
  const result = await NotificationModel.updateMany(
    {
      recipientUserId,
      archivedAt: null,
      readAt: null,
    },
    {
      $set: {
        readAt: now,
        seenAt: now,
        updatedAt: now,
      },
      $inc: { version: 1 },
    },
  )

  return {
    updatedCount: result.modifiedCount,
    notificationIds,
    version,
  }
}

export async function markNotificationsSeen({
  recipientUserId,
  ids,
}: {
  recipientUserId: string
  ids: string[]
}): Promise<number> {
  const validIds = ids.filter((id) => isValidObjectId(id))
  if (validIds.length === 0) return 0

  const now = new Date()
  const result = await NotificationModel.updateMany(
    {
      _id: { $in: validIds },
      recipientUserId,
      archivedAt: null,
      seenAt: null,
    },
    {
      $set: {
        seenAt: now,
        updatedAt: now,
      },
    },
  )

  return result.modifiedCount
}

export async function findNotificationByDedupeKey({
  recipientUserId,
  dedupeKey,
}: {
  recipientUserId: string
  dedupeKey: string
}): Promise<ReturnType<typeof toNotification> | null> {
  const doc = await NotificationModel.findOne({
    recipientUserId,
    dedupeKey,
  }).lean<NotificationRecord | null>()

  if (!doc) return null
  return toNotification(doc)
}

export async function markNotificationReadByDedupeKey({
  recipientUserId,
  dedupeKey,
}: {
  recipientUserId: string
  dedupeKey: string
}): Promise<ReturnType<typeof toNotification> | null> {
  const now = new Date()
  const doc = await NotificationModel.findOneAndUpdate(
    {
      recipientUserId,
      dedupeKey,
      archivedAt: null,
      readAt: null,
    },
    {
      $set: {
        readAt: now,
        seenAt: now,
        updatedAt: now,
      },
      $inc: { version: 1 },
    },
    { new: true, returnDocument: 'after' },
  ).lean<NotificationRecord | null>()

  if (!doc) return null
  return toNotification(doc)
}
