import { ACTION_PLAN_UNCHANGED_REASONS, type ActionPlanUnchangedReason } from '@rpg/contracts'

import {
  formatAllSelectedDescriptorCount,
  formatBlockedOfWouldChangeDescription,
  formatBulkResolveTally,
  formatCountPhrase,
  formatDescriptorCount,
  formatSubjectVerb,
  formatWouldChangeUnchangedSummary,
  type BulkActionDescriptor,
} from '@/lib/actions/action-count-grammar'

export const BULK_CHANGE_PARENT_DESCRIPTOR: BulkActionDescriptor = {
  nounSingular: 'location',
  nounPlural: 'locations',
}

export const BULK_CHANGE_PARENT_MENU_LABEL = 'Change parent location'

export const BULK_CHANGE_PARENT_DIALOG_HEADLINE = 'Change parent location'

export const BULK_CHANGE_PARENT_PARENT_FIELD_LABEL = 'Parent location'

export const BULK_CHANGE_PARENT_NONE_OPTION_LABEL = 'No parent location'

export const BULK_CHANGE_PARENT_PARENT_FIELD_PLACEHOLDER = 'Select a parent location'

export function formatBulkChangeParentDialogDescription(selectedCount: number): string {
  return `Choose a new parent for ${formatDescriptorCount(selectedCount, BULK_CHANGE_PARENT_DESCRIPTOR)}.`
}

function formatLocationHomogeneousUnchangedReason(input: {
  count: number
  reason: ActionPlanUnchangedReason
  parentName?: string
}): string {
  const parentLabel = input.parentName?.trim() || 'the selected parent'

  switch (input.reason) {
    case ACTION_PLAN_UNCHANGED_REASONS.already_target_parent:
      return formatCountPhrase(input.count, {
        zero: '0 already uses the selected parent',
        one: `1 already uses ${parentLabel}`,
        many: `${input.count} already use ${parentLabel}`,
      })
    case ACTION_PLAN_UNCHANGED_REASONS.already_top_level:
      return formatCountPhrase(input.count, {
        zero: '0 already top-level',
        one: '1 is already top-level',
        many: `${input.count} are already top-level`,
      })
    default:
      return `${input.count} unchanged`
  }
}

function formatLocationAllUnchangedSummary(input: {
  unchangedCount: number
  unchangedReasons: readonly ActionPlanUnchangedReason[]
  parentName?: string
  isClearing: boolean
}): string {
  if (
    input.unchangedReasons.length === 1 &&
    input.unchangedReasons[0] === ACTION_PLAN_UNCHANGED_REASONS.already_target_parent &&
    input.parentName
  ) {
    return formatCountPhrase(input.unchangedCount, {
      zero: `All 0 locations already use ${input.parentName}.`,
      one: `All 1 location already uses ${input.parentName}.`,
      many: `All ${input.unchangedCount} locations already use ${input.parentName}.`,
    })
  }

  if (
    input.unchangedReasons.length === 1 &&
    input.unchangedReasons[0] === ACTION_PLAN_UNCHANGED_REASONS.already_top_level &&
    input.isClearing
  ) {
    return formatCountPhrase(input.unchangedCount, {
      zero: 'All 0 locations are already top-level.',
      one: 'All 1 location is already top-level.',
      many: `All ${input.unchangedCount} locations are already top-level.`,
    })
  }

  return `${formatAllSelectedDescriptorCount(input.unchangedCount, BULK_CHANGE_PARENT_DESCRIPTOR)} are already up to date.`
}

export function formatBulkChangeParentConfigureSummary(input: {
  wouldChangeCount: number
  unchangedCount: number
  unchangedReasons: readonly ActionPlanUnchangedReason[]
  parentName?: string
  isClearing: boolean
}): string {
  if (input.wouldChangeCount === 0 && input.unchangedCount > 0) {
    return formatLocationAllUnchangedSummary(input)
  }

  return formatWouldChangeUnchangedSummary({
    wouldChangeCount: input.wouldChangeCount,
    unchangedCount: input.unchangedCount,
    unchangedReasons: input.unchangedReasons,
    descriptor: BULK_CHANGE_PARENT_DESCRIPTOR,
    parentName: input.parentName,
    formatWouldChangeSegment: ({ wouldChangeCount, descriptor }) => {
      if (input.isClearing) {
        return `${formatDescriptorCount(wouldChangeCount, descriptor)} will become top-level`
      }

      const parentLabel = input.parentName?.trim() || 'the selected parent'
      return `${formatDescriptorCount(wouldChangeCount, descriptor)} will move under ${parentLabel}`
    },
    formatHomogeneousReason: ({ count, reason }) =>
      formatLocationHomogeneousUnchangedReason({
        count,
        reason,
        parentName: input.parentName,
      }),
  })
}

export function formatBulkChangeParentConfigureApplyLabel(input: {
  wouldChangeCount: number
  isClearing: boolean
}): string | undefined {
  if (input.wouldChangeCount === 0) {
    return undefined
  }

  const countPhrase = formatDescriptorCount(input.wouldChangeCount, BULK_CHANGE_PARENT_DESCRIPTOR)

  if (input.isClearing) {
    return `Remove parent from ${countPhrase}`
  }

  return `Apply to ${countPhrase}`
}

export function formatBulkChangeParentResolveApplyLabel(
  confirmedCount: number,
): string | undefined {
  if (confirmedCount === 0) {
    return undefined
  }

  return `Apply to ${formatDescriptorCount(confirmedCount, BULK_CHANGE_PARENT_DESCRIPTOR)}`
}

export function formatBulkChangeParentBlockedTitle(mode: 'bulk-all' | 'bulk-partial'): string {
  if (mode === 'bulk-all') {
    return 'Cannot change parent location'
  }

  return 'Cannot update all locations'
}

export function formatBulkChangeParentBlockedDescription(input: {
  mode: 'bulk-all' | 'bulk-partial'
  blockedCount: number
  wouldChangeCount: number
  unchangedCount: number
  unchangedReasons: readonly ActionPlanUnchangedReason[]
  parentName?: string
}): string {
  if (input.mode === 'bulk-partial') {
    return formatBlockedOfWouldChangeDescription({
      blockedCount: input.blockedCount,
      wouldChangeCount: input.wouldChangeCount,
      descriptor: BULK_CHANGE_PARENT_DESCRIPTOR,
      blockerKind: 'hierarchy rules',
    })
  }

  const base = 'All locations that would change are blocked by hierarchy rules.'

  if (input.unchangedCount === 0) {
    return base
  }

  const othersPhrase = formatCountPhrase(input.unchangedCount, {
    zero: '0 other selected locations',
    one: '1 other selected location',
    many: `${input.unchangedCount} other selected locations`,
  })

  if (
    input.unchangedReasons.length === 1 &&
    input.unchangedReasons[0] === ACTION_PLAN_UNCHANGED_REASONS.already_target_parent &&
    input.parentName
  ) {
    const verb = formatSubjectVerb(input.unchangedCount, { one: 'uses', many: 'use' })
    return `${base} ${othersPhrase} already ${verb} ${input.parentName} and ${formatSubjectVerb(input.unchangedCount, { one: 'needs', many: 'need' })} no update.`
  }

  return `${base} ${othersPhrase} ${formatSubjectVerb(input.unchangedCount, { one: 'needs', many: 'need' })} no update.`
}

export function formatBulkChangeParentResolveTally(input: {
  readyCount: number
  blockedCount: number
  unchangedCount: number
  unchangedReasons: readonly ActionPlanUnchangedReason[]
  parentName?: string
}): string {
  return formatBulkResolveTally({
    readyCount: input.readyCount,
    blockedCount: input.blockedCount,
    unchangedCount: input.unchangedCount,
    unchangedReasons: input.unchangedReasons,
    descriptor: BULK_CHANGE_PARENT_DESCRIPTOR,
    formatHomogeneousUnchangedReason: ({ count, reason }) =>
      formatLocationHomogeneousUnchangedReason({
        count,
        reason,
        parentName: input.parentName,
      }),
  })
}

export function formatBulkChangeParentResolutionLegend(input: {
  mode: 'partial' | 'all-blocked'
}): string {
  if (input.mode === 'all-blocked') {
    return `Blocked ${BULK_CHANGE_PARENT_DESCRIPTOR.nounPlural}`
  }

  return `${BULK_CHANGE_PARENT_DESCRIPTOR.nounPlural} to update`
}

export type BulkChangeParentToastInput = {
  updatedCount: number
  blockedCount: number
  parentName?: string
  isClearing: boolean
}

export function formatBulkChangeParentSuccessToast(input: BulkChangeParentToastInput): {
  title: string
  description?: string
  tone: 'success' | 'warning'
} {
  const countPhrase = formatDescriptorCount(input.updatedCount, BULK_CHANGE_PARENT_DESCRIPTOR)

  if (input.blockedCount > 0) {
    const blockedPhrase = formatDescriptorCount(input.blockedCount, BULK_CHANGE_PARENT_DESCRIPTOR)
    return {
      title: `Parent updated for ${countPhrase}`,
      description: `${blockedPhrase} ${formatSubjectVerb(input.blockedCount, { one: 'was', many: 'were' })} left unchanged.`,
      tone: 'warning',
    }
  }

  if (input.isClearing) {
    return {
      title: `Parent removed from ${countPhrase}`,
      tone: 'success',
    }
  }

  const parentLabel = input.parentName?.trim() || 'the selected parent'

  return {
    title: `Parent updated for ${countPhrase}`,
    description: `The selected locations were moved under ${parentLabel}.`,
    tone: 'success',
  }
}
