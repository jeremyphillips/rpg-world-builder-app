import type { z } from 'zod'

import { characterRelationshipDraftEdgesSchema } from '../character-relationships/draft'
import { npcCharacterSchema } from './sheet'

// ---------------------------------------------------------------------------
// CreateNpcRequestInput — client wire shape for POST /api/campaigns/:id/npcs.
// campaignId and characterType are route/service-assigned, not client-supplied.
// ---------------------------------------------------------------------------

export const createNpcRequestInputSchema = npcCharacterSchema
  .omit({
    id: true,
    userId: true,
    characterType: true,
    vital: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    relationshipEdges: characterRelationshipDraftEdgesSchema.optional(),
  })

export type CreateNpcRequestInput = z.infer<typeof createNpcRequestInputSchema>

export type CreateNpcServiceInput = CreateNpcRequestInput & {
  characterType: 'npc'
}
