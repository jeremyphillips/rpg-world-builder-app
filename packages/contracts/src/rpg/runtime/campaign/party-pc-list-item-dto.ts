import { z } from 'zod'

import { characterCardViewModelSchema } from '../character/character-card-dtos'

// ---------------------------------------------------------------------------
// Campaign party PC list item — composed character card + member + roster wire shape.
// ---------------------------------------------------------------------------

export const campaignPartyPcListItemSchema = z.object({
  character: characterCardViewModelSchema,
  member: z
    .object({
      id: z.string().min(1),
      displayName: z.string().min(1),
    })
    .nullable(),
  roster: z.object({
    status: z.enum(['active', 'inactive', 'retired']),
    notes: z.string().optional(),
  }),
})

export type CampaignPartyPcListItem = z.infer<typeof campaignPartyPcListItemSchema>
