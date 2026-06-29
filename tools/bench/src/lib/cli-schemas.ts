import { z } from 'zod'

import { createTicketInputSchema, ticketCreatedBySchema } from '@rpg/contracts/dev-bench'

/** CLI-only extension — epicName resolved to epicId before API call. */
export const addTicketCliInputSchema = createTicketInputSchema.omit({ createdBy: true }).extend({
  epicName: z.string().optional(),
  createdBy: ticketCreatedBySchema.optional(),
})

export type AddTicketCliInput = z.infer<typeof addTicketCliInputSchema>
