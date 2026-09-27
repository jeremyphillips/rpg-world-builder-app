import { z } from 'zod'
import { addCustomRefinementIssue } from '@rpg/contracts'

import {
  epicStatusSchema,
  ticketAreaSchema,
  ticketCreatedBySchema,
  ticketPrioritySchema,
  ticketSizeSchema,
  ticketStatusSchema,
  ticketTypeSchema,
} from '@rpg/contracts/dev-bench'

export const listTicketBucketSchema = z.enum(['active', 'done'])

export type ListTicketBucket = z.infer<typeof listTicketBucketSchema>

export const listTicketsQuerySchema = z
  .object({
    status: ticketStatusSchema.optional(),
    epicId: z.string().min(1).optional(),
    epicName: z.string().min(1).optional(),
    bucket: listTicketBucketSchema.optional(),
    area: ticketAreaSchema.optional(),
    type: ticketTypeSchema.optional(),
    priority: ticketPrioritySchema.optional(),
    size: ticketSizeSchema.optional(),
    createdBy: ticketCreatedBySchema.optional(),
  })
  .superRefine((query, ctx) => {
    if (query.bucket !== undefined && query.status !== undefined) {
      addCustomRefinementIssue(ctx, 'Provide either bucket or status, not both.', ['bucket'])
    }
  })

export type ListTicketsQuery = z.infer<typeof listTicketsQuerySchema>

export const listEpicsQuerySchema = z.object({
  status: epicStatusSchema.optional(),
  area: ticketAreaSchema.optional(),
})

export type ListEpicsQuery = z.infer<typeof listEpicsQuerySchema>
