import { z } from 'zod'

import { ticketAreaSchema } from './ticket-area'
import { ticketPrioritySchema } from './ticket'

// ---------------------------------------------------------------------------
// Epic enums
// ---------------------------------------------------------------------------

export const EPIC_STATUSES = ['active', 'paused', 'done'] as const

export const epicStatusSchema = z.enum(EPIC_STATUSES)
export type EpicStatus = z.infer<typeof epicStatusSchema>

export const EPIC_STATUS_LABELS: Record<EpicStatus, string> = {
  active: 'Active',
  paused: 'Paused',
  done: 'Done',
}

export function getEpicStatusLabel(status: string): string {
  return EPIC_STATUS_LABELS[status as EpicStatus] ?? status
}

// ---------------------------------------------------------------------------
// Epic entity
// ---------------------------------------------------------------------------

export const epicSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  goal: z.string().optional(),
  status: epicStatusSchema,
  priority: ticketPrioritySchema.optional(),
  area: ticketAreaSchema.optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type Epic = z.infer<typeof epicSchema>
