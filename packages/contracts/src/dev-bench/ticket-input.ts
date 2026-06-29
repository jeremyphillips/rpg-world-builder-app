import { z } from 'zod'

import { codeRefSchema } from './code-ref'
import { ticketAreaSchema } from './ticket-area'
import {
  ticketCreatedBySchema,
  ticketPrioritySchema,
  ticketSizeSchema,
  ticketStatusSchema,
  ticketTypeSchema,
} from './ticket'

export const createTicketInputSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  type: ticketTypeSchema,
  status: ticketStatusSchema.default('backlog'),
  priority: ticketPrioritySchema,
  size: ticketSizeSchema,
  area: ticketAreaSchema.optional(),
  epicId: z.string().nullable().optional(),
  blockedByTicketIds: z.array(z.string()).default([]),
  relatedTicketIds: z.array(z.string()).default([]),
  acceptanceCriteria: z.array(z.string()).default([]),
  codeRefs: z.array(codeRefSchema).default([]),
  createdBy: ticketCreatedBySchema,
})

export type CreateTicketInput = z.infer<typeof createTicketInputSchema>

export const updateTicketInputSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  type: ticketTypeSchema.optional(),
  status: ticketStatusSchema.optional(),
  priority: ticketPrioritySchema.optional(),
  size: ticketSizeSchema.optional(),
  area: ticketAreaSchema.optional(),
  epicId: z.string().nullable().optional(),
  blockedByTicketIds: z.array(z.string()).optional(),
  relatedTicketIds: z.array(z.string()).optional(),
  acceptanceCriteria: z.array(z.string()).optional(),
  codeRefs: z.array(codeRefSchema).optional(),
  createdBy: ticketCreatedBySchema.optional(),
})

export type UpdateTicketInput = z.infer<typeof updateTicketInputSchema>
