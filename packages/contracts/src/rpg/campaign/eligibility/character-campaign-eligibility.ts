import { z } from 'zod'

// ---------------------------------------------------------------------------
// Character campaign eligibility — discriminated issue and warning contracts.
// Contracts own codes and payloads; the dashboard owns display copy.
// ---------------------------------------------------------------------------

export const characterCampaignBlockingIssueSchema = z.discriminatedUnion('code', [
  z.object({
    code: z.literal('level_mismatch'),
    actualLevel: z.number().int().min(0),
    requiredLevel: z.number().int().min(1),
  }),
  z.object({
    code: z.literal('conflicting_open_participation'),
    conflictingCampaignName: z.string().min(1).optional(),
  }),
  z.object({
    code: z.literal('species_unavailable'),
    contentId: z.string().min(1),
    label: z.string().min(1),
  }),
  z.object({
    code: z.literal('class_unavailable'),
    contentId: z.string().min(1),
    label: z.string().min(1),
  }),
  z.object({
    code: z.literal('subclass_unavailable'),
    contentId: z.string().min(1),
    label: z.string().min(1),
  }),
  z.object({
    code: z.literal('not_owned_pc'),
  }),
  z.object({
    code: z.literal('structurally_invalid'),
  }),
])

export type CharacterCampaignBlockingIssue = z.infer<typeof characterCampaignBlockingIssueSchema>

export const CHARACTER_CAMPAIGN_WARNING_CATEGORIES = [
  'equipment',
  'spells',
  'feats',
  'proficiencies',
] as const

export const characterCampaignWarningCategorySchema = z.enum(CHARACTER_CAMPAIGN_WARNING_CATEGORIES)

export type CharacterCampaignWarningCategory = z.infer<
  typeof characterCampaignWarningCategorySchema
>

export const characterCampaignWarningSchema = z.object({
  code: z.literal('content_unavailable'),
  category: characterCampaignWarningCategorySchema,
  contentId: z.string().min(1),
  label: z.string().min(1),
})

export type CharacterCampaignWarning = z.infer<typeof characterCampaignWarningSchema>

export const characterCampaignEligibilitySchema = z.object({
  eligible: z.boolean(),
  blockingIssues: z.array(characterCampaignBlockingIssueSchema),
  warnings: z.array(characterCampaignWarningSchema),
})

export type CharacterCampaignEligibility = z.infer<typeof characterCampaignEligibilitySchema>

/** Deterministic combobox / summary ordering for blocking reasons. */
export const CHARACTER_CAMPAIGN_BLOCKING_ISSUE_PRIORITY: readonly CharacterCampaignBlockingIssue['code'][] =
  [
    'not_owned_pc',
    'conflicting_open_participation',
    'structurally_invalid',
    'level_mismatch',
    'species_unavailable',
    'class_unavailable',
    'subclass_unavailable',
  ]

export function compareBlockingIssuesByPriority(
  left: CharacterCampaignBlockingIssue,
  right: CharacterCampaignBlockingIssue,
): number {
  return (
    CHARACTER_CAMPAIGN_BLOCKING_ISSUE_PRIORITY.indexOf(left.code) -
    CHARACTER_CAMPAIGN_BLOCKING_ISSUE_PRIORITY.indexOf(right.code)
  )
}

export function sortBlockingIssuesByPriority(
  issues: readonly CharacterCampaignBlockingIssue[],
): CharacterCampaignBlockingIssue[] {
  return [...issues].sort(compareBlockingIssuesByPriority)
}

export function primaryBlockingIssue(
  issues: readonly CharacterCampaignBlockingIssue[],
): CharacterCampaignBlockingIssue | undefined {
  return sortBlockingIssuesByPriority(issues)[0]
}
