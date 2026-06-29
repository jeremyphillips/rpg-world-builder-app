import mongoose, { type InferSchemaType, type Model } from 'mongoose'

const { model, models, Schema } = mongoose

import {
  TICKET_CREATED_BY,
  TICKET_PRIORITIES,
  TICKET_SIZES,
  TICKET_STATUSES,
  TICKET_TYPES,
} from '@rpg/contracts/dev-bench'

const codeRefMongooseSchema = new Schema(
  {
    packageName: { type: String, trim: true },
    path: { type: String, required: true, trim: true },
    symbol: { type: String, trim: true },
    lineStart: { type: Number },
    lineEnd: { type: Number },
    note: { type: String, trim: true },
  },
  { _id: false },
)

const devBenchTicketSchema = new Schema(
  {
    key: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    type: { type: String, enum: TICKET_TYPES, required: true },
    status: { type: String, enum: TICKET_STATUSES, required: true },
    priority: { type: String, enum: TICKET_PRIORITIES, required: true },
    size: { type: String, enum: TICKET_SIZES, required: true },
    area: { type: String, trim: true },
    epicId: { type: String, default: null },
    blockedByTicketIds: { type: [String], default: [] },
    relatedTicketIds: { type: [String], default: [] },
    acceptanceCriteria: { type: [String], default: [] },
    codeRefs: { type: [codeRefMongooseSchema], default: [] },
    createdBy: { type: String, enum: TICKET_CREATED_BY, required: true },
  },
  { timestamps: true, collection: 'devBenchTickets' },
)

devBenchTicketSchema.index({ key: 1 }, { unique: true })
devBenchTicketSchema.index({ status: 1 })
devBenchTicketSchema.index({ epicId: 1 })
devBenchTicketSchema.index({ area: 1 })

export type DevBenchTicketSchemaType = InferSchemaType<typeof devBenchTicketSchema>

export const DevBenchTicketModel: Model<DevBenchTicketSchemaType> =
  (models.DevBenchTicket as Model<DevBenchTicketSchemaType>) ??
  model<DevBenchTicketSchemaType>('DevBenchTicket', devBenchTicketSchema)
