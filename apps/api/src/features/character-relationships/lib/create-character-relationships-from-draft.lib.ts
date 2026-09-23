import {
  CHARACTER_RELATIONSHIP_DRAFT_NEW_CHARACTER_ENDPOINT,
  type CharacterRelationshipDraftEdge,
  type CreateCharacterRelationshipInput,
} from '@rpg/contracts'

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
    {
      kind:
        | 'parentOf'
        | 'partnerOf'
        | 'siblingOf'
        | 'mentorOf'
        | 'rivalOf'
        | 'friendOf'
        | 'allyOf'
        | 'enemyOf'
    }
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

export function toCreateRelationshipInput(
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
