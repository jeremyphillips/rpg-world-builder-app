import { z } from 'zod'

import { CONTENT_USAGE_SUMMARY_LIMIT } from './content-usage-limits'

export const CHARACTER_RELATIONSHIP_KINDS = [
  'class',
  'subclass',
  'species',
  'owns',
  'knows',
  'prepared',
  'has',
  'member',
] as const

export const characterRelationshipKindSchema = z.enum(CHARACTER_RELATIONSHIP_KINDS)

export type CharacterRelationshipKind = z.infer<typeof characterRelationshipKindSchema>

export const CHARACTER_RELATIONSHIP_KIND_ORDER: Record<CharacterRelationshipKind, number> = {
  prepared: 0,
  knows: 1,
  class: 2,
  subclass: 3,
  has: 4,
  member: 5,
  owns: 6,
  species: 7,
}

export const characterRelationshipSchema = z.object({
  kind: characterRelationshipKindSchema,
  characterId: z.string().min(1),
  characterName: z.string().min(1),
})

export type CharacterRelationship = z.infer<typeof characterRelationshipSchema>

export const viewerCharacterRelationshipGroupSchema = z.object({
  kind: characterRelationshipKindSchema,
  count: z.number().int().min(1),
  relationships: z.array(characterRelationshipSchema).min(1).max(CONTENT_USAGE_SUMMARY_LIMIT),
})

export type ViewerCharacterRelationshipGroup = z.infer<
  typeof viewerCharacterRelationshipGroupSchema
>

export const viewerCharacterRelationshipsPresentationSchema = z.object({
  hasNoun: z.string().min(1).optional(),
})

export type ViewerCharacterRelationshipsPresentation = z.infer<
  typeof viewerCharacterRelationshipsPresentationSchema
>

export const viewerCharacterRelationshipsSchema = z.object({
  groups: z.array(viewerCharacterRelationshipGroupSchema).min(1),
  count: z.number().int().min(1),
  presentation: viewerCharacterRelationshipsPresentationSchema.optional(),
})

export type ViewerCharacterRelationships = z.infer<typeof viewerCharacterRelationshipsSchema>
