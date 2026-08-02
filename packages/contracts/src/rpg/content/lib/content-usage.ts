import { z } from 'zod'

import { vocabularyUsageReferenceSchema } from '../../vocab/vocabulary-usage'

/** Display labels for overview Used by summary tooltips — API-owned. */
export const contentUsageSummaryLabelsSchema = z.object({
  singular: z.string().min(1),
  plural: z.string().min(1),
})

export type ContentUsageSummaryLabels = z.infer<typeof contentUsageSummaryLabelsSchema>

/**
 * Declared batch scope for overview Used by — descriptive metadata only.
 * `characters` means overview counts are character-scoped (v1 discovery).
 * `complete` means batch covers all registered source kinds.
 */
export const CONTENT_OVERVIEW_USAGE_SCOPES = ['complete', 'characters'] as const

export const contentOverviewUsageScopeSchema = z.enum(CONTENT_OVERVIEW_USAGE_SCOPES)

export type ContentOverviewUsageScope = z.infer<typeof contentOverviewUsageScopeSchema>

/** Max items in overview usedBySummary — API payload bound for list responses. */
export const CONTENT_USAGE_SUMMARY_LIMIT = 4

/**
 * Informational content usage reference — same identity shape as vocabulary so
 * shared dashboard usage chrome can render without a parallel mapper.
 */
export const contentInformationalUsageReferenceSchema = vocabularyUsageReferenceSchema

export type ContentInformationalUsageReference = z.infer<
  typeof contentInformationalUsageReferenceSchema
>

/** Neutral content-entry usage — informational GET only. */
export const contentEntryUsageSchema = z
  .object({
    references: z.array(contentInformationalUsageReferenceSchema),
  })
  .transform(({ references }) => ({
    references,
    usedBy: references.length,
  }))

export type ContentEntryUsage = z.infer<typeof contentEntryUsageSchema>

/** List-row usage fields when a type registers batch sources. */
export const contentListUsageFieldsSchema = z.object({
  usedBy: z.number().int().min(0),
  /**
   * Bounded overview chrome only — capped server-side, non-authoritative preview.
   * `usedBy` is the count SSOT.
   */
  usedBySummary: z
    .array(contentInformationalUsageReferenceSchema)
    .max(CONTENT_USAGE_SUMMARY_LIMIT)
    .optional(),
})

export type ContentListUsageFields = z.infer<typeof contentListUsageFieldsSchema>
