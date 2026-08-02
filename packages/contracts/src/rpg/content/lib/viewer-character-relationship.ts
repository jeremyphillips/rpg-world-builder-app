import { z } from 'zod'

/** Per-group preview bound — keep aligned with CONTENT_USAGE_SUMMARY_LIMIT in content-usage.ts */
const VIEWER_CHARACTER_RELATIONSHIP_PREVIEW_LIMIT = 4

export const CHARACTER_RELATIONSHIP_KINDS = [
  'class',
  'species',
  'owns',
  'knows',
  'prepared',
  'has',
  'member',
] as const

export const characterRelationshipKindSchema = z.enum(CHARACTER_RELATIONSHIP_KINDS)

export type CharacterRelationshipKind = z.infer<typeof characterRelationshipKindSchema>

export const characterRelationshipSchema = z.object({
  kind: characterRelationshipKindSchema,
  characterId: z.string().min(1),
  characterName: z.string().min(1),
})

export type CharacterRelationship = z.infer<typeof characterRelationshipSchema>

export const viewerCharacterRelationshipGroupSchema = z.object({
  kind: characterRelationshipKindSchema,
  count: z.number().int().min(1),
  relationships: z
    .array(characterRelationshipSchema)
    .min(1)
    .max(VIEWER_CHARACTER_RELATIONSHIP_PREVIEW_LIMIT),
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
