import {
  CREATE_SETUP_DEFAULT_GROUPED_SUMMARY_EYEBROW,
  CREATE_SETUP_DEFAULT_SKIPPED_VALUE_LABEL,
} from './create-setup.constants'
import type { CreateSetupChoiceSet, CreateSetupSet } from './create-setup.types'

export type CreateSetupGroupedChoiceRow = {
  setId: string
  label: string
  valueLabel: string
}

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

export function isCreateSetupSummaryEligibleSet(args: {
  set: CreateSetupSet
  activeSetId: string | null
}): boolean {
  if (!args.set.isComplete) return false
  return args.set.id !== args.activeSetId
}

export function resolveCreateSetupPartialSummaryRows(args: {
  setIds: readonly string[]
  setById: ReadonlyMap<string, CreateSetupChoiceSet | undefined>
}): CreateSetupGroupedChoiceRow[] {
  return args.setIds.flatMap((setId) => {
    const set = args.setById.get(setId)
    if (!set || set.kind !== 'choice') {
      return []
    }

    return [
      {
        setId,
        label: resolveCreateSetupSummaryRowLabel(set),
        valueLabel: resolveCreateSetupChoiceValueLabel(set),
      },
    ]
  })
}

export type CreateSetupPartialSummarySegment =
  | { kind: 'group'; summaryGroup: string; setIds: string[] }
  | { kind: 'standalone'; setId: string }

export function resolveCreateSetupPartialSummarySegments(args: {
  sets: readonly CreateSetupSet[]
  visibleSetIds: readonly string[]
  activeSetId: string | null
}): CreateSetupPartialSummarySegment[] {
  const setById = new Map(args.sets.map((set) => [set.id, set]))
  const renderedGroups = new Set<string>()
  const renderedStandalone = new Set<string>()
  const segments: CreateSetupPartialSummarySegment[] = []

  for (const setId of args.visibleSetIds) {
    const set = setById.get(setId)
    if (!set) continue
    if (!isCreateSetupSummaryEligibleSet({ set, activeSetId: args.activeSetId })) continue

    const summaryGroup = set.summaryGroup
    if (summaryGroup) {
      if (renderedGroups.has(summaryGroup)) continue
      renderedGroups.add(summaryGroup)

      const memberSetIds = resolveCreateSetupSummaryGroupMemberIds(args.sets, summaryGroup)
      const eligibleMemberSetIds = memberSetIds.filter((memberSetId) => {
        const member = setById.get(memberSetId)
        return (
          member && isCreateSetupSummaryEligibleSet({ set: member, activeSetId: args.activeSetId })
        )
      })

      if (eligibleMemberSetIds.length > 0) {
        segments.push({ kind: 'group', summaryGroup, setIds: eligibleMemberSetIds })
      }
      continue
    }

    if (renderedStandalone.has(set.id)) continue
    renderedStandalone.add(set.id)
    segments.push({ kind: 'standalone', setId: set.id })
  }

  return segments
}
