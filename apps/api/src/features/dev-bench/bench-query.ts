import { z } from 'zod'

import {
  epicStatusSchema,
  ticketAreaSchema,
  ticketCreatedBySchema,
  ticketPrioritySchema,
  ticketSizeSchema,
  ticketStatusSchema,
  ticketTypeSchema,
} from '@rpg/contracts/dev-bench'

export const listTicketsQuerySchema = z.object({
  status: ticketStatusSchema.optional(),
  epicId: z.string().min(1).optional(),
  area: ticketAreaSchema.optional(),
  type: ticketTypeSchema.optional(),
  priority: ticketPrioritySchema.optional(),
  size: ticketSizeSchema.optional(),
  createdBy: ticketCreatedBySchema.optional(),
})

export type ListTicketsQuery = z.infer<typeof listTicketsQuerySchema>

export const listEpicsQuerySchema = z.object({
  status: epicStatusSchema.optional(),
  area: ticketAreaSchema.optional(),
})

export type ListEpicsQuery = z.infer<typeof listEpicsQuerySchema>
