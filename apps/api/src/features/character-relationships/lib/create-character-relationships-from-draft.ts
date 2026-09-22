import { randomUUID } from 'node:crypto'

import {
  CHARACTER_RELATIONSHIP_DRAFT_NEW_CHARACTER_ENDPOINT,
  type CharacterRelationshipDraftEdge,
  type CreateCharacterRelationshipInput,
} from '@rpg/contracts'

import type { WithMongoSession } from '../../../lib/mongo-session'
import { createCharacterRelationshipRecord } from '../character-relationship.repository'
import { assertCreateCharacterRelationshipEndpoints } from './assert-relationship-endpoints'

function resolveDraftCharacterId(endpoint: string, characterId: string): string {
  return endpoint === CHARACTER_RELATIONSHIP_DRAFT_NEW_CHARACTER_ENDPOINT ? characterId : endpoint
}

function toOrganizationMembershipInput(
  edge: Extract<CharacterRelationshipDraftEdge, { kind: 'organizationMembership' }>,
  characterId: string,
): CreateCharacterRelationshipInput {
  return {
    kind: edge.kind,
    characterId: resolveDraftCharacterId(edge.characterId, characterId),
    organizationId: edge.organizationId,
    ...(edge.details ? { details: edge.details } : {}),
  }
}

function toLocationRelationshipInput(
  edge: Extract<
    CharacterRelationshipDraftEdge,
    {
      kind: 'resides_at' | 'owns' | 'tenant' | 'operator' | 'works_at' | 'hometown' | 'birthplace'
    }
  >,
  characterId: string,
): CreateCharacterRelationshipInput {
  return {
    kind: edge.kind,
    characterId: resolveDraftCharacterId(edge.characterId, characterId),
    locationId: edge.locationId,
    ...(edge.details ? { details: edge.details } : {}),
  } as CreateCharacterRelationshipInput
}

function toCharacterRelationshipInput(
  edge: Extract<
    CharacterRelationshipDraftEdge,
    { kind: 'parentOf' | 'partnerOf' | 'siblingOf' | 'mentorOf' | 'rivalOf' }
  >,
  characterId: string,
): CreateCharacterRelationshipInput {
  return {
    kind: edge.kind,
    characterId: resolveDraftCharacterId(edge.characterId, characterId),
    relatedCharacterId: resolveDraftCharacterId(edge.relatedCharacterId, characterId),
    ...(edge.details ? { details: edge.details } : {}),
  } as CreateCharacterRelationshipInput
}

function toCreateRelationshipInput(
  edge: CharacterRelationshipDraftEdge,
  characterId: string,
): CreateCharacterRelationshipInput {
  switch (edge.kind) {
    case 'organizationMembership':
      return toOrganizationMembershipInput(edge, characterId)
    case 'resides_at':
    case 'owns':
    case 'tenant':
    case 'operator':
    case 'works_at':
    case 'hometown':
    case 'birthplace':
      return toLocationRelationshipInput(edge, characterId)
    default:
      return toCharacterRelationshipInput(edge, characterId)
  }
}

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
