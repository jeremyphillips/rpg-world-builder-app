import type { RecommendationSourceKind } from '@rpg/contracts'

import type {
  SelectionBlockerReason,
  SelectionGuidanceEntry,
  SelectionNoticeReason,
  SelectionRequirementGuidanceKind,
  SelectionRequirementRole,
  SelectionSignalCategory,
  SelectionSourceReason,
  SelectionStatusEntry,
  SelectionStatusReason,
  SelectionWarningReason,
} from './selection-row-status.types'

export const SELECTION_STATUS_REASON_CATEGORY = {
  unavailable: 'availability',
  not_purchasable: 'availability',
  acquisition_blocked: 'availability',
  conversion_blocked: 'availability',
  unaffordable: 'affordability',
  not_proficient: 'compatibility',
  ability_score_requirement: 'compatibility',
  selection_full: 'capacity',
  already_granted: 'capacity',
} as const satisfies Record<SelectionStatusReason, SelectionSignalCategory>

export const SELECTION_REQUIREMENT_ROLE_CATEGORY = {
  candidate: 'requirement_open',
  satisfier: 'requirement_held',
} as const satisfies Record<SelectionRequirementRole, SelectionSignalCategory>

export const SELECTION_SOURCE_REASON_CATEGORY = {
  in_package: 'source',
  open_pool: 'source',
  alternative_package: 'source',
} as const satisfies Record<SelectionSourceReason, SelectionSignalCategory>

export function selectionRecommendationCategory(owned: boolean): SelectionSignalCategory {
  return owned ? 'recommendation_held' : 'recommendation'
}

/** Stable semantic key from ordered parts (`warning:ability_score_requirement:str`). */
export function selectionEntryKey(...parts: readonly (string | undefined)[]): string {
  return parts.filter((part): part is string => Boolean(part)).join(':')
}

type StatusEntryOptions = { subject?: string; detail?: string }

function statusEntry(
  kind: SelectionStatusEntry['kind'],
  reason: SelectionStatusReason,
  label: string,
  options: StatusEntryOptions,
): SelectionStatusEntry {
  return {
    key: selectionEntryKey(kind, reason, options.subject),
    category: SELECTION_STATUS_REASON_CATEGORY[reason],
    kind,
    reason,
    label,
    ...(options.subject ? { subject: options.subject } : {}),
    ...(options.detail ? { detail: options.detail } : {}),
  }
}

export function selectionBlocker(
  reason: SelectionBlockerReason,
  label: string,
  options: StatusEntryOptions = {},
): SelectionStatusEntry {
  return statusEntry('blocker', reason, label, options)
}

export function selectionWarning(
  reason: SelectionWarningReason,
  label: string,
  options: StatusEntryOptions = {},
): SelectionStatusEntry {
  return statusEntry('warning', reason, label, options)
}

export function selectionNotice(
  reason: SelectionNoticeReason,
  label: string,
  options: StatusEntryOptions = {},
): SelectionStatusEntry {
  return statusEntry('notice', reason, label, options)
}

type SourcedGuidanceArgs = {
  label: string
  sourceKind?: RecommendationSourceKind
  sourceLabels?: readonly string[]
}

function sourcedGuidanceFields(args: SourcedGuidanceArgs) {
  return {
    label: args.label,
    ...(args.sourceKind ? { sourceKind: args.sourceKind } : {}),
    ...(args.sourceLabels?.length ? { sourceLabels: args.sourceLabels } : {}),
  }
}

export function selectionRequirement(
  args: SourcedGuidanceArgs & {
    kind: SelectionRequirementGuidanceKind
    role: SelectionRequirementRole
  },
): SelectionGuidanceEntry {
  return {
    key: selectionEntryKey('guidance', args.kind, args.sourceKind, args.role),
    category: SELECTION_REQUIREMENT_ROLE_CATEGORY[args.role],
    kind: args.kind,
    ...sourcedGuidanceFields(args),
  }
}

export function selectionRecommendation(
  args: SourcedGuidanceArgs & { owned: boolean },
): SelectionGuidanceEntry {
  return {
    key: selectionEntryKey('guidance', 'recommendation', args.sourceKind),
    category: selectionRecommendationCategory(args.owned),
    kind: 'recommendation',
    ...sourcedGuidanceFields(args),
  }
}

export function selectionSource(
  reason: SelectionSourceReason,
  label: string,
): SelectionGuidanceEntry {
  return {
    key: selectionEntryKey('guidance', 'source', reason),
    category: SELECTION_SOURCE_REASON_CATEGORY[reason],
    kind: reason === 'alternative_package' ? 'package_option' : 'source',
    reason,
    label,
  }
}
