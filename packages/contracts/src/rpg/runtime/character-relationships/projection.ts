import { z } from 'zod'

import { paginatedItemsSchema, type PaginatedItems } from '../../../lib/paginated-items'
import { characterTypeSchema } from '../character/sheet/core'
import {
  characterRelationshipEdgeKindSchema,
  type CharacterRelationshipEdgeKind,
} from '../../vocab/character-relationship/kind'
import { characterRelationshipReferenceStatusSchema } from '../../vocab/character-relationship/reference-status'
import { characterRelationshipSectionSchema } from '../../vocab/character-relationship/section'
import { characterRelationshipVisibilitySchema } from '../../vocab/character-relationship/visibility'

const relationshipProjectionTargetBaseSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
})

export const relationshipProjectionCharacterTargetSchema =
  relationshipProjectionTargetBaseSchema.extend({
    type: z.literal('character'),
    characterType: characterTypeSchema,
  })

export const relationshipProjectionOrganizationTargetSchema =
  relationshipProjectionTargetBaseSchema.extend({
    type: z.literal('organization'),
    slug: z.string().min(1),
  })

export const relationshipProjectionLocationTargetSchema =
  relationshipProjectionTargetBaseSchema.extend({
    type: z.literal('location'),
    slug: z.string().min(1),
  })

export const relationshipProjectionTargetSchema = z.discriminatedUnion('type', [
  relationshipProjectionCharacterTargetSchema,
  relationshipProjectionOrganizationTargetSchema,
  relationshipProjectionLocationTargetSchema,
])

export type RelationshipProjectionTarget = z.infer<typeof relationshipProjectionTargetSchema>

export const characterRelationshipProjectionRowSchema = z.object({
  relationshipId: z.string().min(1),
  kind: characterRelationshipEdgeKindSchema,
  section: characterRelationshipSectionSchema,
  roleLabel: z.string().min(1),
  details: z.record(z.string(), z.unknown()),
  visibility: characterRelationshipVisibilitySchema,
  referenceStatus: characterRelationshipReferenceStatusSchema,
  target: relationshipProjectionTargetSchema.optional(),
  revision: z.number().int().positive(),
  capabilities: z.object({
    canUpdateDetails: z.boolean(),
    canDelete: z.boolean(),
  }),
})

export type CharacterRelationshipProjectionRow = z.infer<
  typeof characterRelationshipProjectionRowSchema
>

export const characterRelationshipsProjectionResponseSchema = paginatedItemsSchema(
  characterRelationshipProjectionRowSchema,
)

export type CharacterRelationshipsProjectionResponse =
  PaginatedItems<CharacterRelationshipProjectionRow>

export const characterRelationshipsListQuerySchema = z.object({
  cursor: z.string().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  kinds: z
    .union([characterRelationshipEdgeKindSchema, z.array(characterRelationshipEdgeKindSchema)])
    .optional()
    .transform((value) =>
      value === undefined ? undefined : Array.isArray(value) ? value : [value],
    ),
})

export type CharacterRelationshipsListQuery = z.infer<typeof characterRelationshipsListQuerySchema>

export function resolveRelationshipProjectionRoleLabel(input: {
  kind: CharacterRelationshipEdgeKind
  viewerCharacterId: string
  sourceCharacterId: string
  forwardLabel: string
  inverseLabel: string
}): string {
  return input.viewerCharacterId === input.sourceCharacterId
    ? input.forwardLabel
    : input.inverseLabel
}
