import mongoose, { type InferSchemaType, type Model } from 'mongoose'

const { model, models, Schema } = mongoose

import {
  NOTIFICATION_ACTION_KINDS,
  NOTIFICATION_TYPES,
  type NotificationAction,
  type NotificationPayloadByType,
  type NotificationType,
} from '@rpg/contracts'

const notificationActionSchema = new Schema(
  {
    kind: { type: String, enum: NOTIFICATION_ACTION_KINDS, required: true },
    campaignId: { type: String },
    conversationId: { type: String },
    inviteId: { type: String },
  },
  { _id: false },
)

const notificationSchema = new Schema(
  {
    recipientUserId: { type: String, required: true, index: true },
    type: { type: String, enum: NOTIFICATION_TYPES, required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: null, trim: true },
    actorLabel: { type: String, default: null, trim: true },
    subjectLabel: { type: String, default: null, trim: true },
    payload: { type: Schema.Types.Mixed, required: true },
    action: { type: notificationActionSchema, default: null },
    dedupeKey: { type: String, default: null },
    seenAt: { type: Date, default: null },
    readAt: { type: Date, default: null },
    // Phase 1: stored and indexed for future pruning; no archive API sets this yet.
    archivedAt: { type: Date, default: null },
    version: { type: Number, default: 1, required: true },
  },
  { timestamps: true },
)

notificationSchema.index({ recipientUserId: 1, archivedAt: 1, createdAt: -1 })
notificationSchema.index({ recipientUserId: 1, readAt: 1, archivedAt: 1 })
notificationSchema.index(
  { recipientUserId: 1, dedupeKey: 1 },
  {
    unique: true,
    partialFilterExpression: { dedupeKey: { $type: 'string' } },
  },
)

export type NotificationSchemaType = InferSchemaType<typeof notificationSchema>

export type NotificationRecordPayload<T extends NotificationType = NotificationType> =
  NotificationPayloadByType[T]

export type NotificationRecordAction = NotificationAction

export const NotificationModel: Model<NotificationSchemaType> =
  (models.Notification as Model<NotificationSchemaType>) ??
  model<NotificationSchemaType>('Notification', notificationSchema)
