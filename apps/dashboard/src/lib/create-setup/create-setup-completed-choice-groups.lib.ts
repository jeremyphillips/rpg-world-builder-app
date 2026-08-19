import { CREATE_SETUP_DEFAULT_SKIPPED_VALUE_LABEL } from './create-setup.constants'
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

export function isCreateSetupSetCollapsedComplete(args: {
  setId: string
  visibleSetIds: readonly string[]
  isCollapsedComplete: (setId: string) => boolean
}): boolean {
  return args.visibleSetIds.includes(args.setId) && args.isCollapsedComplete(args.setId)
}

export function resolveCreateSetupCollapsedCompleteGroupedSetIds(args: {
  groupMemberSetIds: readonly string[]
  visibleSetIds: readonly string[]
  isCollapsedComplete: (setId: string) => boolean
}): string[] {
  return args.groupMemberSetIds.filter((setId) =>
    isCreateSetupSetCollapsedComplete({
      setId,
      visibleSetIds: args.visibleSetIds,
      isCollapsedComplete: args.isCollapsedComplete,
    }),
  )
}

/** True when every declared group member is visible, complete, and collapsed. */
export function isCreateSetupGroupedChoiceSummaryReady(args: {
  groupMemberSetIds: readonly string[]
  visibleSetIds: readonly string[]
  isCollapsedComplete: (setId: string) => boolean
}): boolean {
  if (args.groupMemberSetIds.length < 2) {
    return false
  }

  const collapsedCompleteIds = resolveCreateSetupCollapsedCompleteGroupedSetIds(args)
  return collapsedCompleteIds.length === args.groupMemberSetIds.length
}

export function resolveCreateSetupGroupedChoiceRows(args: {
  groupMemberSetIds: readonly string[]
  setById: ReadonlyMap<string, CreateSetupChoiceSet | undefined>
  /** When set, only these ids are included (preserving declared order). */
  collapsedCompleteSetIds?: readonly string[]
}): CreateSetupGroupedChoiceRow[] {
  const setIds = args.collapsedCompleteSetIds ?? args.groupMemberSetIds

  return setIds.flatMap((setId) => {
    const set = args.setById.get(setId)
    if (!set || set.kind !== 'choice') {
      return []
    }

    return [
      {
        setId,
        label: set.fieldLabel,
        valueLabel: resolveCreateSetupChoiceValueLabel(set),
      },
    ]
  })
}
