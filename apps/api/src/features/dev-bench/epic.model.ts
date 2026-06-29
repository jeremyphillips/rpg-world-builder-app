import mongoose, { type InferSchemaType, type Model } from 'mongoose'

const { model, models, Schema } = mongoose

import { EPIC_STATUSES, TICKET_PRIORITIES } from '@rpg/contracts/dev-bench'

const devBenchEpicSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    goal: { type: String, trim: true },
    status: { type: String, enum: EPIC_STATUSES, required: true },
    priority: { type: String, enum: TICKET_PRIORITIES },
    area: { type: String, trim: true },
    badgeColor: { type: String, trim: true },
  },
  { timestamps: true, collection: 'devBenchEpics' },
)

devBenchEpicSchema.index({ status: 1 })
devBenchEpicSchema.index({ area: 1 })

export type DevBenchEpicSchemaType = InferSchemaType<typeof devBenchEpicSchema>

export const DevBenchEpicModel: Model<DevBenchEpicSchemaType> =
  (models.DevBenchEpic as Model<DevBenchEpicSchemaType>) ??
  model<DevBenchEpicSchemaType>('DevBenchEpic', devBenchEpicSchema)
