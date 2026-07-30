import { isValidObjectId, Types } from 'mongoose'

import type { NotificationAction, NotificationType } from '@rpg/contracts'

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

  if (input.dedupeKey) {
    const existing = await NotificationModel.findOne({
      recipientUserId: input.recipientUserId,
      dedupeKey: input.dedupeKey,
    }).lean<NotificationRecord | null>()

    if (existing) {
      const doc = await NotificationModel.findOneAndUpdate(
        { _id: existing._id },
        { $set: baseUpdate },
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
}: {
  recipientUserId: string
  limit: number
  cursor?: string
}): Promise<{
  items: ReturnType<typeof toNotification>[]
  nextCursor: string | null
}> {
  const filter: Record<string, unknown> = {
    recipientUserId,
    archivedAt: null,
  }

  const decodedCursor = cursor ? decodeNotificationCursor(cursor) : null
  if (decodedCursor && isValidObjectId(decodedCursor.id)) {
    filter.$or = [
      { createdAt: { $lt: decodedCursor.createdAt } },
      {
        createdAt: decodedCursor.createdAt,
        _id: { $lt: new Types.ObjectId(decodedCursor.id) },
      },
    ]
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
    },
    { new: true, returnDocument: 'after' },
  ).lean<NotificationRecord | null>()

  if (!doc) return null
  return toNotification(doc)
}

export async function markAllNotificationsRead(recipientUserId: string): Promise<number> {
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
    },
  )

  return result.modifiedCount
}

export async function markNotificationsSeen({
  recipientUserId,
  ids,
}: {
  recipientUserId: string
  ids: string[]
}): Promise<number> {
  const now = new Date()
  const result = await NotificationModel.updateMany(
    {
      _id: { $in: ids },
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
