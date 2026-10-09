import type { OptionPresentationRequirementRole, RecommendationSourceKind } from '@rpg/contracts'

/** Severity kinds — badges (`blocker`, `warning`) and muted capacity text (`notice`), in rank order. */
export const SELECTION_STATUS_KINDS = ['blocker', 'warning', 'notice'] as const
export type SelectionStatusKind = (typeof SELECTION_STATUS_KINDS)[number]

/** Structural blocks first; the temporary budget block last. */
export const SELECTION_BLOCKER_REASONS = [
  'unavailable',
  'not_purchasable',
  'acquisition_blocked',
  'conversion_blocked',
  'unaffordable',
] as const
export type SelectionBlockerReason = (typeof SELECTION_BLOCKER_REASONS)[number]

export const SELECTION_WARNING_REASONS = ['not_proficient', 'ability_score_requirement'] as const
export type SelectionWarningReason = (typeof SELECTION_WARNING_REASONS)[number]

export const SELECTION_NOTICE_REASONS = ['selection_full', 'already_granted'] as const
export type SelectionNoticeReason = (typeof SELECTION_NOTICE_REASONS)[number]

/** Every status reason, in rank order within its kind. */
export const SELECTION_STATUS_REASONS = [
  ...SELECTION_BLOCKER_REASONS,
  ...SELECTION_WARNING_REASONS,
  ...SELECTION_NOTICE_REASONS,
] as const
export type SelectionStatusReason = (typeof SELECTION_STATUS_REASONS)[number]

/** Guidance kinds, rendered as text, in rank order. */
export const SELECTION_GUIDANCE_KINDS = [
  'requirement',
  'requirement_match',
  'package_option',
  'recommendation',
  'source',
] as const
export type SelectionGuidanceKind = (typeof SELECTION_GUIDANCE_KINDS)[number]

export type SelectionRequirementGuidanceKind = Extract<
  SelectionGuidanceKind,
  'requirement' | 'requirement_match'
>

export const SELECTION_SOURCE_REASONS = ['in_package', 'open_pool', 'alternative_package'] as const
export type SelectionSourceReason = (typeof SELECTION_SOURCE_REASONS)[number]

/** Semantic signal categories. Context policies are allow-lists over these. */
export const SELECTION_SIGNAL_CATEGORIES = [
  'availability',
  'affordability',
  'compatibility',
  'capacity',
  'requirement_open',
  'requirement_held',
  'recommendation',
  'recommendation_held',
  'source',
] as const
export type SelectionSignalCategory = (typeof SELECTION_SIGNAL_CATEGORIES)[number]

export type SelectionRequirementRole = OptionPresentationRequirementRole

/** Build entries with the `selection*` constructors — never by hand. */
export type SelectionStatusEntry = {
  /** Semantic identity for dedupe; never compared against labels. */
  key: string
  category: SelectionSignalCategory
  kind: SelectionStatusKind
  reason: SelectionStatusReason
  /** Disambiguates entries sharing a reason (ability id for `ability_score_requirement`). */
  subject?: string
  label: string
  /** Supplemental — rendered as `title`; the label must stand on its own. */
  detail?: string
}

/** Build entries with the `selection*` constructors — never by hand. */
export type SelectionGuidanceEntry = {
  key: string
  category: SelectionSignalCategory
  kind: SelectionGuidanceKind
  /** `source` entries only. */
  reason?: SelectionSourceReason
  sourceKind?: RecommendationSourceKind
  label: string
  /** Named sources (`Wizard class`) — supplemental `title` text. */
  sourceLabels?: readonly string[]
}

export type SelectionRowPresentation = {
  status: readonly SelectionStatusEntry[]
  guidance: readonly SelectionGuidanceEntry[]
}

export const EMPTY_SELECTION_ROW_PRESENTATION: SelectionRowPresentation = {
  status: [],
  guidance: [],
}
