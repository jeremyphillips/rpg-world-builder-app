import { z } from 'zod'

import {
  characterRelationshipVisibilitySchema,
  DEFAULT_CHARACTER_RELATIONSHIP_VISIBILITY,
} from '../../vocab/character-relationship/visibility'
import {
  enduringPersonRelationshipDetailsSchema,
  lifecyclePersonRelationshipDetailsSchema,
  membershipRelationshipDetailsSchema,
  ownershipRelationshipDetailsSchema,
  placeAssociationRelationshipDetailsSchema,
  residenceRelationshipDetailsSchema,
} from './details'

export const characterRelationshipEdgeEnvelopeSchema = z.object({
  id: z.string().min(1),
  campaignId: z.string().min(1),
  revision: z.number().int().positive(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  createdByUserId: z.string().min(1),
  visibility: characterRelationshipVisibilitySchema.default(
    DEFAULT_CHARACTER_RELATIONSHIP_VISIBILITY,
  ),
  /** PC character ids granted when visibility is specific_players. */
  participantIds: z.array(z.string()).default([]),
})

export type CharacterRelationshipEdgeEnvelope = z.infer<
  typeof characterRelationshipEdgeEnvelopeSchema
>

const organizationMembershipRelationshipSchema = characterRelationshipEdgeEnvelopeSchema.extend({
  kind: z.literal('organizationMembership'),
  characterId: z.string().min(1),
  organizationId: z.string().min(1),
  details: membershipRelationshipDetailsSchema,
})

const residesAtRelationshipSchema = characterRelationshipEdgeEnvelopeSchema.extend({
  kind: z.literal('resides_at'),
  characterId: z.string().min(1),
  locationId: z.string().min(1),
  details: residenceRelationshipDetailsSchema,
})

const ownsRelationshipSchema = characterRelationshipEdgeEnvelopeSchema.extend({
  kind: z.literal('owns'),
  characterId: z.string().min(1),
  locationId: z.string().min(1),
  details: ownershipRelationshipDetailsSchema,
})

const tenantRelationshipSchema = characterRelationshipEdgeEnvelopeSchema.extend({
  kind: z.literal('tenant'),
  characterId: z.string().min(1),
  locationId: z.string().min(1),
  details: ownershipRelationshipDetailsSchema,
})

const operatorRelationshipSchema = characterRelationshipEdgeEnvelopeSchema.extend({
  kind: z.literal('operator'),
  characterId: z.string().min(1),
  locationId: z.string().min(1),
  details: ownershipRelationshipDetailsSchema,
})

const worksAtRelationshipSchema = characterRelationshipEdgeEnvelopeSchema.extend({
  kind: z.literal('works_at'),
  characterId: z.string().min(1),
  locationId: z.string().min(1),
  details: ownershipRelationshipDetailsSchema,
})

const hometownRelationshipSchema = characterRelationshipEdgeEnvelopeSchema.extend({
  kind: z.literal('hometown'),
  characterId: z.string().min(1),
  locationId: z.string().min(1),
  details: placeAssociationRelationshipDetailsSchema,
})

const birthplaceRelationshipSchema = characterRelationshipEdgeEnvelopeSchema.extend({
  kind: z.literal('birthplace'),
  characterId: z.string().min(1),
  locationId: z.string().min(1),
  details: placeAssociationRelationshipDetailsSchema,
})

const parentOfRelationshipSchema = characterRelationshipEdgeEnvelopeSchema.extend({
  kind: z.literal('parentOf'),
  characterId: z.string().min(1),
  relatedCharacterId: z.string().min(1),
  details: enduringPersonRelationshipDetailsSchema,
})

const partnerOfRelationshipSchema = characterRelationshipEdgeEnvelopeSchema.extend({
  kind: z.literal('partnerOf'),
  characterId: z.string().min(1),
  relatedCharacterId: z.string().min(1),
  details: lifecyclePersonRelationshipDetailsSchema,
})

const siblingOfRelationshipSchema = characterRelationshipEdgeEnvelopeSchema.extend({
  kind: z.literal('siblingOf'),
  characterId: z.string().min(1),
  relatedCharacterId: z.string().min(1),
  details: enduringPersonRelationshipDetailsSchema,
})

const mentorOfRelationshipSchema = characterRelationshipEdgeEnvelopeSchema.extend({
  kind: z.literal('mentorOf'),
  characterId: z.string().min(1),
  relatedCharacterId: z.string().min(1),
  details: lifecyclePersonRelationshipDetailsSchema,
})

const rivalOfRelationshipSchema = characterRelationshipEdgeEnvelopeSchema.extend({
  kind: z.literal('rivalOf'),
  characterId: z.string().min(1),
  relatedCharacterId: z.string().min(1),
  details: lifecyclePersonRelationshipDetailsSchema,
})

const friendOfRelationshipSchema = characterRelationshipEdgeEnvelopeSchema.extend({
  kind: z.literal('friendOf'),
  characterId: z.string().min(1),
  relatedCharacterId: z.string().min(1),
  details: lifecyclePersonRelationshipDetailsSchema,
})

const allyOfRelationshipSchema = characterRelationshipEdgeEnvelopeSchema.extend({
  kind: z.literal('allyOf'),
  characterId: z.string().min(1),
  relatedCharacterId: z.string().min(1),
  details: lifecyclePersonRelationshipDetailsSchema,
})

const enemyOfRelationshipSchema = characterRelationshipEdgeEnvelopeSchema.extend({
  kind: z.literal('enemyOf'),
  characterId: z.string().min(1),
  relatedCharacterId: z.string().min(1),
  details: lifecyclePersonRelationshipDetailsSchema,
})

export const characterRelationshipEdgeSchema = z.discriminatedUnion('kind', [
  organizationMembershipRelationshipSchema,
  residesAtRelationshipSchema,
  ownsRelationshipSchema,
  tenantRelationshipSchema,
  operatorRelationshipSchema,
  worksAtRelationshipSchema,
  hometownRelationshipSchema,
  birthplaceRelationshipSchema,
  parentOfRelationshipSchema,
  partnerOfRelationshipSchema,
  siblingOfRelationshipSchema,
  mentorOfRelationshipSchema,
  rivalOfRelationshipSchema,
  friendOfRelationshipSchema,
  allyOfRelationshipSchema,
  enemyOfRelationshipSchema,
])

export type CharacterRelationshipEdge = z.infer<typeof characterRelationshipEdgeSchema>

export function parseCharacterRelationshipEdge(value: unknown): CharacterRelationshipEdge {
  return characterRelationshipEdgeSchema.parse(value)
}
