import { z } from 'zod'

import {
  characterRelationshipSchema,
  characterRelationshipKindSchema,
  viewerCharacterRelationshipsPresentationSchema,
} from '../../primitives/viewer-character-relationship'
import { USAGE_REFERENCE_PREVIEW_LIMIT } from '../../primitives/usage/preview-limits'

/** Global search preview — relationship groups capped for result-row chrome. */
export const globalSearchViewerCharacterRelationshipGroupSchema = z.object({
  kind: characterRelationshipKindSchema,
  count: z.number().int().min(1),
  relationships: z.array(characterRelationshipSchema).min(1).max(USAGE_REFERENCE_PREVIEW_LIMIT),
})

export const globalSearchViewerCharacterRelationshipsSchema = z.object({
  groups: z.array(globalSearchViewerCharacterRelationshipGroupSchema).min(1),
  count: z.number().int().min(1),
  presentation: viewerCharacterRelationshipsPresentationSchema.optional(),
})

export type GlobalSearchViewerCharacterRelationships = z.infer<
  typeof globalSearchViewerCharacterRelationshipsSchema
>
