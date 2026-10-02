import {
  CREATE_SETUP_DEFAULT_GROUPED_SUMMARY_EYEBROW,
  CREATE_SETUP_DEFAULT_SKIPPED_VALUE_LABEL,
} from './create-setup.constants'
import type { CreateSetupChoiceSet, CreateSetupSet } from './create-setup.types'

export function resolveCreateSetupChoiceValueLabel(set: CreateSetupChoiceSet): string {
  if (set.skipped) {
    return set.skippedValueLabel ?? CREATE_SETUP_DEFAULT_SKIPPED_VALUE_LABEL
  }

  const selectedOption = set.options.find((option) => option.value === set.value)
  return selectedOption?.label ?? set.value
}

export function resolveCreateSetupSummaryRowLabel(set: CreateSetupChoiceSet): string {
  return set.summaryLabel ?? set.fieldLabel
}

export function resolveCreateSetupSummaryGroupMemberIds(
  sets: readonly CreateSetupSet[],
  summaryGroup: string,
): string[] {
  return sets.flatMap((set) => (set.summaryGroup === summaryGroup ? [set.id] : []))
}

export function resolveCreateSetupSummaryGroups(
  sets: readonly CreateSetupSet[],
): Map<string, string[]> {
  const groups = new Map<string, string[]>()

  for (const set of sets) {
    if (!set.summaryGroup) continue
    const members = groups.get(set.summaryGroup) ?? []
    members.push(set.id)
    groups.set(set.summaryGroup, members)
  }

  return groups
}

export function resolveCreateSetupSummaryGroupEyebrow(
  sets: readonly CreateSetupSet[],
  summaryGroup: string,
): string | undefined {
  return sets.find((set) => set.summaryGroup === summaryGroup)?.summaryGroupEyebrow
}

export function resolveCreateSetupSummaryGroupDisplayEyebrow(
  sets: readonly CreateSetupSet[],
  summaryGroup: string,
): string {
  return (
    resolveCreateSetupSummaryGroupEyebrow(sets, summaryGroup) ??
    CREATE_SETUP_DEFAULT_GROUPED_SUMMARY_EYEBROW
  )
}
