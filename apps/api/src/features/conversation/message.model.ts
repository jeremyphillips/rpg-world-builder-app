import mongoose, { type InferSchemaType, type Model } from 'mongoose'

const { model, models, Schema } = mongoose

const messageContentSchema = new Schema(
  {
    kind: { type: String, enum: ['text'], required: true },
    text: { type: String, required: true, trim: true },
  },
  { _id: false },
)

const messageSchema = new Schema(
  {
    conversationId: { type: String, required: true, index: true },
    senderUserId: { type: String, required: true },
    content: { type: messageContentSchema, required: true },
    clientMessageId: { type: String, default: null },
    editedAt: { type: Date, default: null },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
)

messageSchema.index({ conversationId: 1, createdAt: -1, _id: -1 })
messageSchema.index(
  { conversationId: 1, senderUserId: 1, clientMessageId: 1 },
  {
    unique: true,
    partialFilterExpression: { clientMessageId: { $type: 'string' } },
  },
)

export type MessageSchemaType = InferSchemaType<typeof messageSchema>

export const MessageModel: Model<MessageSchemaType> =
  (models.Message as Model<MessageSchemaType>) ?? model<MessageSchemaType>('Message', messageSchema)
