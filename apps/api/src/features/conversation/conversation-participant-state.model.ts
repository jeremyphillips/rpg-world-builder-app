import mongoose, { type InferSchemaType, type Model } from 'mongoose'

const { model, models, Schema } = mongoose

const conversationParticipantStateSchema = new Schema(
  {
    conversationId: { type: String, required: true },
    userId: { type: String, required: true },
    lastReadMessageId: { type: String, default: null },
    lastReadAt: { type: Date, default: null },
    version: { type: Number, default: 1, required: true },
  },
  { timestamps: true },
)

conversationParticipantStateSchema.index({ conversationId: 1, userId: 1 }, { unique: true })
conversationParticipantStateSchema.index({ userId: 1, updatedAt: -1 })

export type ConversationParticipantStateSchemaType = InferSchemaType<
  typeof conversationParticipantStateSchema
>

export const ConversationParticipantStateModel: Model<ConversationParticipantStateSchemaType> =
  (models.ConversationParticipantState as Model<ConversationParticipantStateSchemaType>) ??
  model<ConversationParticipantStateSchemaType>(
    'ConversationParticipantState',
    conversationParticipantStateSchema,
  )
