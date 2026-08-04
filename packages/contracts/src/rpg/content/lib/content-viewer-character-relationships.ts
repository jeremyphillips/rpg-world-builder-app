import { z } from 'zod'

import {
  characterRelationshipSchema,
  characterRelationshipKindSchema,
  viewerCharacterRelationshipsPresentationSchema,
} from '../../primitives/character/viewer-character-relationship'
import { USAGE_REFERENCE_PREVIEW_LIMIT } from '../../primitives/usage/preview-limits'

/** Content overview preview — relationship groups capped for list-row chrome. */
export const contentViewerCharacterRelationshipGroupSchema = z.object({
  kind: characterRelationshipKindSchema,
  count: z.number().int().min(1),
  relationships: z.array(characterRelationshipSchema).min(1).max(USAGE_REFERENCE_PREVIEW_LIMIT),
})

export const contentViewerCharacterRelationshipsSchema = z.object({
  groups: z.array(contentViewerCharacterRelationshipGroupSchema).min(1),
  count: z.number().int().min(1),
  presentation: viewerCharacterRelationshipsPresentationSchema.optional(),
})

export type ContentViewerCharacterRelationships = z.infer<
  typeof contentViewerCharacterRelationshipsSchema
>
