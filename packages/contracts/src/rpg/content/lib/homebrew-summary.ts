import { z } from 'zod'

import type { ContentTypeKey } from './content-type-keys'

/** Visible-sidebar content types summarized on the Homebrew hub. */
export const HOMEBREW_SUMMARY_CONTENT_TYPE_KEYS = [
  'classes',
  'spells',
  'species',
  'feats',
  'equipment',
  'skill-proficiencies',
  'organizations',
  'locations',
] as const satisfies readonly ContentTypeKey[]

export const homebrewSummaryContentTypeSchema = z.enum(HOMEBREW_SUMMARY_CONTENT_TYPE_KEYS)

export type HomebrewSummaryContentType = z.infer<typeof homebrewSummaryContentTypeSchema>

export const homebrewContentSummaryItemSchema = z.object({
  contentType: homebrewSummaryContentTypeSchema,
  totalCount: z.number().int().min(0),
})

export type HomebrewContentSummaryItem = z.infer<typeof homebrewContentSummaryItemSchema>

export const homebrewContentSummarySchema = z.object({
  content: z.array(homebrewContentSummaryItemSchema),
})

export type HomebrewContentSummary = z.infer<typeof homebrewContentSummarySchema>
