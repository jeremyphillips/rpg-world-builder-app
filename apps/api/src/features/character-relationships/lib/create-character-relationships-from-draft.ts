import { randomUUID } from 'node:crypto'

import type { CharacterRelationshipDraftEdge } from '@rpg/contracts'

import type { WithMongoSession } from '../../../lib/mongo-session'
import { createCharacterRelationshipRecord } from '../character-relationship.repository'
import { assertCreateCharacterRelationshipEndpoints } from './assert-relationship-endpoints'
import { toCreateRelationshipInput } from './create-character-relationships-from-draft.lib'

export async function createCharacterRelationshipsFromDraftEdges(input: {
  campaignId: string
  actorUserId: string
  characterId: string
  edges: readonly CharacterRelationshipDraftEdge[]
  options?: WithMongoSession
}): Promise<void> {
  for (const edge of input.edges) {
    const relationship = toCreateRelationshipInput(edge, input.characterId)
    await assertCreateCharacterRelationshipEndpoints(input.campaignId, relationship, input.options)
    await createCharacterRelationshipRecord(
      {
        id: randomUUID(),
        campaignId: input.campaignId,
        createdByUserId: input.actorUserId,
        ...relationship,
      },
      input.options,
    )
  }
}
