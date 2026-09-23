import { z } from 'zod'

import {
  enduringPersonRelationshipDetailsSchema,
  lifecyclePersonRelationshipDetailsSchema,
  membershipRelationshipDetailsSchema,
  ownershipRelationshipDetailsSchema,
  placeAssociationRelationshipDetailsSchema,
  residenceRelationshipDetailsSchema,
} from './details'
import {
  type DirectedPersonRelationshipRole,
  normalizeDirectedPersonRelationshipEndpoints,
} from './canonical-endpoints'

export const CHARACTER_RELATIONSHIP_DRAFT_NEW_CHARACTER_ENDPOINT = '__new_character__' as const

export const characterRelationshipDraftEndpointSchema = z.union([
  z.string().min(1),
  z.literal(CHARACTER_RELATIONSHIP_DRAFT_NEW_CHARACTER_ENDPOINT),
])

export type CharacterRelationshipDraftEndpoint = z.infer<
  typeof characterRelationshipDraftEndpointSchema
>

const draftRelationshipBaseSchema = z.object({
  id: z.string().min(1),
  characterId: characterRelationshipDraftEndpointSchema,
})

export const characterRelationshipDraftEdgeSchema = z.discriminatedUnion('kind', [
  draftRelationshipBaseSchema.extend({
    kind: z.literal('organizationMembership'),
    organizationId: z.string().min(1),
    details: membershipRelationshipDetailsSchema.optional(),
  }),
  draftRelationshipBaseSchema.extend({
    kind: z.literal('resides_at'),
    locationId: z.string().min(1),
    details: residenceRelationshipDetailsSchema.optional(),
  }),
  draftRelationshipBaseSchema.extend({
    kind: z.literal('owns'),
    locationId: z.string().min(1),
    details: ownershipRelationshipDetailsSchema.optional(),
  }),
  draftRelationshipBaseSchema.extend({
    kind: z.literal('tenant'),
    locationId: z.string().min(1),
    details: ownershipRelationshipDetailsSchema.optional(),
  }),
  draftRelationshipBaseSchema.extend({
    kind: z.literal('operator'),
    locationId: z.string().min(1),
    details: ownershipRelationshipDetailsSchema.optional(),
  }),
  draftRelationshipBaseSchema.extend({
    kind: z.literal('works_at'),
    locationId: z.string().min(1),
    details: ownershipRelationshipDetailsSchema.optional(),
  }),
  draftRelationshipBaseSchema.extend({
    kind: z.literal('hometown'),
    locationId: z.string().min(1),
    details: placeAssociationRelationshipDetailsSchema.optional(),
  }),
  draftRelationshipBaseSchema.extend({
    kind: z.literal('birthplace'),
    locationId: z.string().min(1),
    details: placeAssociationRelationshipDetailsSchema.optional(),
  }),
  draftRelationshipBaseSchema.extend({
    kind: z.literal('parentOf'),
    relatedCharacterId: characterRelationshipDraftEndpointSchema,
    details: enduringPersonRelationshipDetailsSchema.optional(),
  }),
  draftRelationshipBaseSchema.extend({
    kind: z.literal('partnerOf'),
    relatedCharacterId: characterRelationshipDraftEndpointSchema,
    details: lifecyclePersonRelationshipDetailsSchema.optional(),
  }),
  draftRelationshipBaseSchema.extend({
    kind: z.literal('siblingOf'),
    relatedCharacterId: characterRelationshipDraftEndpointSchema,
    details: enduringPersonRelationshipDetailsSchema.optional(),
  }),
  draftRelationshipBaseSchema.extend({
    kind: z.literal('mentorOf'),
    relatedCharacterId: characterRelationshipDraftEndpointSchema,
    details: lifecyclePersonRelationshipDetailsSchema.optional(),
  }),
  draftRelationshipBaseSchema.extend({
    kind: z.literal('rivalOf'),
    relatedCharacterId: characterRelationshipDraftEndpointSchema,
    details: lifecyclePersonRelationshipDetailsSchema.optional(),
  }),
  draftRelationshipBaseSchema.extend({
    kind: z.literal('friendOf'),
    relatedCharacterId: characterRelationshipDraftEndpointSchema,
    details: lifecyclePersonRelationshipDetailsSchema.optional(),
  }),
  draftRelationshipBaseSchema.extend({
    kind: z.literal('allyOf'),
    relatedCharacterId: characterRelationshipDraftEndpointSchema,
    details: lifecyclePersonRelationshipDetailsSchema.optional(),
  }),
  draftRelationshipBaseSchema.extend({
    kind: z.literal('enemyOf'),
    relatedCharacterId: characterRelationshipDraftEndpointSchema,
    details: lifecyclePersonRelationshipDetailsSchema.optional(),
  }),
])

export type CharacterRelationshipDraftEdge = z.infer<typeof characterRelationshipDraftEdgeSchema>

export const characterRelationshipDraftEdgesSchema = z.array(characterRelationshipDraftEdgeSchema)

export type CharacterRelationshipDraftEdges = z.infer<typeof characterRelationshipDraftEdgesSchema>

export type CharacterRelationshipDraftProvenance =
  | { source: 'draft'; draftEdgeId: string }
  | { source: 'persisted'; relationshipId: string; revision: number }

export type NormalizedDraftPersonRelationshipEndpoints = {
  characterId: CharacterRelationshipDraftEndpoint
  relatedCharacterId: CharacterRelationshipDraftEndpoint
}

/** Normalizes builder draft person edges before finalization assigns real character IDs. */
export function normalizeDraftPersonRelationshipEdge(input: {
  kind: 'parentOf' | 'mentorOf'
  focalEndpoint: CharacterRelationshipDraftEndpoint
  relatedEndpoint: CharacterRelationshipDraftEndpoint
  role: DirectedPersonRelationshipRole
}): NormalizedDraftPersonRelationshipEndpoints {
  if (
    input.focalEndpoint === CHARACTER_RELATIONSHIP_DRAFT_NEW_CHARACTER_ENDPOINT ||
    input.relatedEndpoint === CHARACTER_RELATIONSHIP_DRAFT_NEW_CHARACTER_ENDPOINT
  ) {
    if (input.kind === 'parentOf') {
      if (input.role === 'parent') {
        return { characterId: input.focalEndpoint, relatedCharacterId: input.relatedEndpoint }
      }
      return { characterId: input.relatedEndpoint, relatedCharacterId: input.focalEndpoint }
    }

    if (input.role === 'mentor') {
      return { characterId: input.focalEndpoint, relatedCharacterId: input.relatedEndpoint }
    }
    return { characterId: input.relatedEndpoint, relatedCharacterId: input.focalEndpoint }
  }

  const normalized = normalizeDirectedPersonRelationshipEndpoints({
    kind: input.kind,
    focalCharacterId: input.focalEndpoint,
    relatedCharacterId: input.relatedEndpoint,
    role: input.role,
  })

  return {
    characterId: normalized.characterId,
    relatedCharacterId: normalized.relatedCharacterId!,
  }
}
