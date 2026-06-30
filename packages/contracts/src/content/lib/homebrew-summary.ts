import { z } from 'zod'

import { CONTENT_TYPE_KEYS } from './content-type-keys'

/** Visible-sidebar content types summarized on the Homebrew hub. */
export const HOMEBREW_SUMMARY_CONTENT_TYPE_KEYS = [...CONTENT_TYPE_KEYS] as const

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

/** @deprecated Use `HOMEBREW_SUMMARY_CONTENT_TYPE_KEYS`. */
export const HOMEBREW_SUMMARY_CONTENT_TYPES = HOMEBREW_SUMMARY_CONTENT_TYPE_KEYS
