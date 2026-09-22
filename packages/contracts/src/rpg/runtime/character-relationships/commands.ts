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
import { characterRelationshipEdgeSchema } from './relationship'

export const CHARACTER_RELATIONSHIP_IDEMPOTENCY_HEADER = 'Idempotency-Key' as const

const createRelationshipBaseSchema = z.object({
  characterId: z.string().min(1),
  visibility: characterRelationshipVisibilitySchema
    .default(DEFAULT_CHARACTER_RELATIONSHIP_VISIBILITY)
    .optional(),
})

export const createCharacterRelationshipInputSchema = z.discriminatedUnion('kind', [
  createRelationshipBaseSchema.extend({
    kind: z.literal('organizationMembership'),
    organizationId: z.string().min(1),
    details: membershipRelationshipDetailsSchema.optional(),
  }),
  createRelationshipBaseSchema.extend({
    kind: z.literal('resides_at'),
    locationId: z.string().min(1),
    details: residenceRelationshipDetailsSchema.optional(),
  }),
  createRelationshipBaseSchema.extend({
    kind: z.literal('owns'),
    locationId: z.string().min(1),
    details: ownershipRelationshipDetailsSchema.optional(),
  }),
  createRelationshipBaseSchema.extend({
    kind: z.literal('tenant'),
    locationId: z.string().min(1),
    details: ownershipRelationshipDetailsSchema.optional(),
  }),
  createRelationshipBaseSchema.extend({
    kind: z.literal('operator'),
    locationId: z.string().min(1),
    details: ownershipRelationshipDetailsSchema.optional(),
  }),
  createRelationshipBaseSchema.extend({
    kind: z.literal('works_at'),
    locationId: z.string().min(1),
    details: ownershipRelationshipDetailsSchema.optional(),
  }),
  createRelationshipBaseSchema.extend({
    kind: z.literal('hometown'),
    locationId: z.string().min(1),
    details: placeAssociationRelationshipDetailsSchema.optional(),
  }),
  createRelationshipBaseSchema.extend({
    kind: z.literal('birthplace'),
    locationId: z.string().min(1),
    details: placeAssociationRelationshipDetailsSchema.optional(),
  }),
  createRelationshipBaseSchema.extend({
    kind: z.literal('parentOf'),
    relatedCharacterId: z.string().min(1),
    details: enduringPersonRelationshipDetailsSchema.optional(),
  }),
  createRelationshipBaseSchema.extend({
    kind: z.literal('partnerOf'),
    relatedCharacterId: z.string().min(1),
    details: lifecyclePersonRelationshipDetailsSchema.optional(),
  }),
  createRelationshipBaseSchema.extend({
    kind: z.literal('siblingOf'),
    relatedCharacterId: z.string().min(1),
    details: enduringPersonRelationshipDetailsSchema.optional(),
  }),
  createRelationshipBaseSchema.extend({
    kind: z.literal('mentorOf'),
    relatedCharacterId: z.string().min(1),
    details: lifecyclePersonRelationshipDetailsSchema.optional(),
  }),
  createRelationshipBaseSchema.extend({
    kind: z.literal('rivalOf'),
    relatedCharacterId: z.string().min(1),
    details: lifecyclePersonRelationshipDetailsSchema.optional(),
  }),
])

export type CreateCharacterRelationshipInput = z.infer<
  typeof createCharacterRelationshipInputSchema
>

export const createCharacterRelationshipCommandSchema = z.object({
  idempotencyKey: z.string().trim().min(1).max(128),
  relationship: createCharacterRelationshipInputSchema,
})

export type CreateCharacterRelationshipCommand = z.infer<
  typeof createCharacterRelationshipCommandSchema
>

export const updateCharacterRelationshipInputSchema = z
  .object({
    expectedRevision: z.number().int().positive(),
    visibility: characterRelationshipVisibilitySchema.optional(),
    details: z.record(z.string(), z.unknown()).optional(),
  })
  .refine((value) => value.visibility !== undefined || value.details !== undefined, {
    message: 'At least one of visibility or details is required.',
  })

export type UpdateCharacterRelationshipInput = z.infer<
  typeof updateCharacterRelationshipInputSchema
>

export const deleteCharacterRelationshipInputSchema = z.object({
  expectedRevision: z.number().int().positive(),
})

export type DeleteCharacterRelationshipInput = z.infer<
  typeof deleteCharacterRelationshipInputSchema
>

export const characterRelationshipRevisionConflictSchema = z.object({
  code: z.literal('stale_revision'),
  message: z.string().min(1),
  relationship: characterRelationshipEdgeSchema,
})

export type CharacterRelationshipRevisionConflict = z.infer<
  typeof characterRelationshipRevisionConflictSchema
>

export const characterRelationshipIdempotencyConflictSchema = z.object({
  code: z.literal('idempotency_key_reused'),
  message: z.string().min(1),
})

export type CharacterRelationshipIdempotencyConflict = z.infer<
  typeof characterRelationshipIdempotencyConflictSchema
>
