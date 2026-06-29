import type { Epic } from '@rpg/contracts/dev-bench'
import { epicSchema } from '@rpg/contracts/dev-bench'

import type { DevBenchEpicSchemaType } from './epic.model'

type EpicRecord = DevBenchEpicSchemaType & {
  _id: unknown
  createdAt: Date
  updatedAt: Date
}

export function toEpic(doc: EpicRecord): Epic {
  return epicSchema.parse({
    id: String(doc._id),
    title: doc.title,
    description: doc.description ?? undefined,
    goal: doc.goal ?? undefined,
    status: doc.status,
    priority: doc.priority ?? undefined,
    area: doc.area ?? undefined,
    badgeColor: doc.badgeColor ?? undefined,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  })
}
