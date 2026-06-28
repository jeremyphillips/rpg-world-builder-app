import mongoose, { type InferSchemaType, type Model } from 'mongoose'

const { model, models, Schema } = mongoose

const devBenchTicketKeyCounterSchema = new Schema(
  {
    _id: { type: String, required: true },
    seq: { type: Number, required: true, default: 0 },
  },
  { collection: 'devBenchTicketKeyCounter' },
)

export type DevBenchTicketKeyCounterSchemaType = InferSchemaType<
  typeof devBenchTicketKeyCounterSchema
>

export const DevBenchTicketKeyCounterModel: Model<DevBenchTicketKeyCounterSchemaType> =
  (models.DevBenchTicketKeyCounter as Model<DevBenchTicketKeyCounterSchemaType>) ??
  model<DevBenchTicketKeyCounterSchemaType>(
    'DevBenchTicketKeyCounter',
    devBenchTicketKeyCounterSchema,
  )

export const TICKET_KEY_COUNTER_ID = 'ticket-key'
