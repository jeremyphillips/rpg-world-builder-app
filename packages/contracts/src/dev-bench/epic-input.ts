import { z } from 'zod'

import { epicStatusSchema } from './epic'
import { ticketAreaSchema } from './ticket-area'
import { ticketPrioritySchema } from './ticket'

export const createEpicInputSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  goal: z.string().optional(),
  status: epicStatusSchema.default('active'),
  priority: ticketPrioritySchema.optional(),
  area: ticketAreaSchema.optional(),
})

export type CreateEpicInput = z.infer<typeof createEpicInputSchema>

export const updateEpicInputSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  goal: z.string().optional(),
  status: epicStatusSchema.optional(),
  priority: ticketPrioritySchema.optional(),
  area: ticketAreaSchema.optional(),
})

export type UpdateEpicInput = z.infer<typeof updateEpicInputSchema>
