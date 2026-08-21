import { z } from 'zod'

import { catalogUsageReferenceSchema } from '../primitives/usage/catalog-usage-reference'
import { characterUsageReferenceSchema } from '../primitives/usage/character-usage-reference'

/** Informational usage reference — same identity blockers reuse at operation boundaries. */
export const vocabularyUsageReferenceSchema = z.discriminatedUnion('kind', [
  catalogUsageReferenceSchema,
  characterUsageReferenceSchema,
])

export type VocabularyUsageReference = z.infer<typeof vocabularyUsageReferenceSchema>

/** Neutral vocabulary entry usage — informational GET only. */
export const vocabularyEntryUsageSchema = z
  .object({
    references: z.array(vocabularyUsageReferenceSchema),
  })
  .transform(({ references }) => ({
    references,
    usedBy: references.length,
  }))

export type VocabularyEntryUsage = z.infer<typeof vocabularyEntryUsageSchema>
