import type { z } from 'zod'

import { npcCharacterSchema } from './sheet'

// ---------------------------------------------------------------------------
// CreateNpcRequestInput — client wire shape for POST /api/campaigns/:id/npcs.
// campaignId and characterType are route/service-assigned, not client-supplied.
// ---------------------------------------------------------------------------

export const createNpcRequestInputSchema = npcCharacterSchema.omit({
  id: true,
  userId: true,
  characterType: true,
  campaignId: true,
  lifecycle: true,
  createdAt: true,
  updatedAt: true,
})

export type CreateNpcRequestInput = z.infer<typeof createNpcRequestInputSchema>

export type CreateNpcServiceInput = CreateNpcRequestInput & {
  characterType: 'npc'
  campaignId: string
}
