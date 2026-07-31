import type { Notification } from '@rpg/contracts'

import type { NotificationSchemaType } from './notification.model'

type NotificationRecord = NotificationSchemaType & {
  _id: unknown
  createdAt: Date
  updatedAt: Date
}

/** Maps a lean notification document to the API `Notification` DTO. */
export function toNotification(doc: NotificationRecord): Notification {
  return {
    id: String(doc._id),
    type: doc.type as Notification['type'],
    title: doc.title,
    ...(doc.description ? { description: doc.description } : {}),
    ...(doc.actorLabel ? { actorLabel: doc.actorLabel } : {}),
    ...(doc.subjectLabel ? { subjectLabel: doc.subjectLabel } : {}),
    ...(doc.action ? { action: doc.action as Notification['action'] } : {}),
    ...(doc.dedupeKey ? { dedupeKey: doc.dedupeKey } : {}),
    seenAt: doc.seenAt ? doc.seenAt.toISOString() : null,
    readAt: doc.readAt ? doc.readAt.toISOString() : null,
    archivedAt: doc.archivedAt ? doc.archivedAt.toISOString() : null,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
    payload: doc.payload as Notification['payload'],
  } as Notification
}
