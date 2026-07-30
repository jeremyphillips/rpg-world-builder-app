import { z } from 'zod'

import { CONTENT_TYPE_KEYS } from '../content/lib/content-type-keys'

/** Informational usage reference — same identity blockers reuse at operation boundaries. */
export const vocabularyUsageReferenceSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('content'),
    contentTypeKey: z.enum(CONTENT_TYPE_KEYS),
    id: z.string(),
    label: z.string(),
    slug: z.string(),
  }),
  z.object({
    kind: z.literal('character'),
    id: z.string(),
    label: z.string(),
    characterType: z.enum(['pc', 'npc']),
    campaignId: z.string().optional(),
  }),
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
