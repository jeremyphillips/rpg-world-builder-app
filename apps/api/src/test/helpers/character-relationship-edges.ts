import { randomUUID } from 'node:crypto'

import {
  buildCharacterRelationshipCanonicalKey,
  DEFAULT_CHARACTER_RELATIONSHIP_VISIBILITY,
  type CharacterLocationConnectionKind,
} from '@rpg/contracts'

import { CharacterRelationshipModel } from '../../features/character-relationships/character-relationship.model'

export async function seedOrganizationMembershipEdge(input: {
  campaignId: string
  characterId: string
  organizationId: string
  actorUserId?: string
  details?: { title?: string; priority?: number }
}): Promise<void> {
  const canonicalEndpointsKey = buildCharacterRelationshipCanonicalKey({
    kind: 'organizationMembership',
    characterId: input.characterId,
    organizationId: input.organizationId,
  })

  await CharacterRelationshipModel.create({
    _id: randomUUID(),
    campaignId: input.campaignId,
    kind: 'organizationMembership',
    characterId: input.characterId,
    organizationId: input.organizationId,
    canonicalEndpointsKey,
    details: input.details ?? {},
    visibility: DEFAULT_CHARACTER_RELATIONSHIP_VISIBILITY,
    createdByUserId: input.actorUserId ?? 'test-user',
    revision: 1,
  })
}

export async function seedCharacterLocationEdge(input: {
  campaignId: string
  characterId: string
  locationId: string
  kind: CharacterLocationConnectionKind
  actorUserId?: string
  relationshipId?: string
}): Promise<void> {
  const canonicalEndpointsKey = buildCharacterRelationshipCanonicalKey({
    kind: input.kind,
    characterId: input.characterId,
    locationId: input.locationId,
  })

  await CharacterRelationshipModel.create({
    _id: input.relationshipId ?? randomUUID(),
    campaignId: input.campaignId,
    kind: input.kind,
    characterId: input.characterId,
    locationId: input.locationId,
    canonicalEndpointsKey,
    details: {},
    visibility: DEFAULT_CHARACTER_RELATIONSHIP_VISIBILITY,
    createdByUserId: input.actorUserId ?? 'test-user',
    revision: 1,
  })
}
