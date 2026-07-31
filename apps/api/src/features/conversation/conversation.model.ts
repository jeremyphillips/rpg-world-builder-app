import mongoose, { type InferSchemaType, type Model } from 'mongoose'

const { model, models, Schema } = mongoose

import { CONVERSATION_KINDS } from '@rpg/contracts'

const conversationLatestMessageSchema = new Schema(
  {
    messageId: { type: String, required: true },
    senderUserId: { type: String, required: true },
    preview: { type: String, required: true, trim: true },
    createdAt: { type: Date, required: true },
  },
  { _id: false },
)

const conversationSchema = new Schema(
  {
    kind: { type: String, enum: CONVERSATION_KINDS, required: true },
    participantKey: { type: String, required: true, unique: true },
    participantUserIds: {
      type: [String],
      required: true,
      validate: {
        validator: (value: string[]) => value.length === 2,
        message: 'Direct conversations require exactly two participants.',
      },
    },
    latestMessage: { type: conversationLatestMessageSchema, default: null },
  },
  { timestamps: true },
)

conversationSchema.index({ participantUserIds: 1, updatedAt: -1 })

export type ConversationSchemaType = InferSchemaType<typeof conversationSchema>

export const ConversationModel: Model<ConversationSchemaType> =
  (models.Conversation as Model<ConversationSchemaType>) ??
  model<ConversationSchemaType>('Conversation', conversationSchema)
