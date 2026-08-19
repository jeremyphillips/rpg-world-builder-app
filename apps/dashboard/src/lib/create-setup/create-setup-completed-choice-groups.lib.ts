import type { CreateSetupChoiceSet } from './create-setup.types'

export type CreateSetupGroupedChoiceRow = {
  setId: string
  label: string
  valueLabel: string
}

export function resolveCreateSetupChoiceValueLabel(set: CreateSetupChoiceSet): string {
  const selectedOption = set.options.find((option) => option.value === set.value)
  return selectedOption?.label ?? set.value
}

export function isCreateSetupSetCollapsedComplete(args: {
  setId: string
  visibleSetIds: readonly string[]
  isCollapsedComplete: (setId: string) => boolean
}): boolean {
  return args.visibleSetIds.includes(args.setId) && args.isCollapsedComplete(args.setId)
}

export function resolveCreateSetupCollapsedCompleteGroupedSetIds(args: {
  groupedChoiceSetIds: readonly string[]
  visibleSetIds: readonly string[]
  isCollapsedComplete: (setId: string) => boolean
}): string[] {
  return args.groupedChoiceSetIds.filter((setId) =>
    isCreateSetupSetCollapsedComplete({
      setId,
      visibleSetIds: args.visibleSetIds,
      isCollapsedComplete: args.isCollapsedComplete,
    }),
  )
}

/** True when every declared id is visible, complete, and collapsed. */
export function isCreateSetupGroupedChoiceSummaryReady(args: {
  groupedChoiceSetIds: readonly string[]
  visibleSetIds: readonly string[]
  isCollapsedComplete: (setId: string) => boolean
  allowPartial?: boolean
}): boolean {
  const collapsedCompleteIds = resolveCreateSetupCollapsedCompleteGroupedSetIds(args)

  if (args.allowPartial) {
    return collapsedCompleteIds.length > 0
  }

  if (args.groupedChoiceSetIds.length < 2) {
    return false
  }

  return collapsedCompleteIds.length === args.groupedChoiceSetIds.length
}

export function resolveCreateSetupGroupedChoiceRows(args: {
  groupedChoiceSetIds: readonly string[]
  setById: ReadonlyMap<string, CreateSetupChoiceSet | undefined>
  /** When set, only these ids are included (preserving declared order). */
  collapsedCompleteSetIds?: readonly string[]
}): CreateSetupGroupedChoiceRow[] {
  const setIds = args.collapsedCompleteSetIds ?? args.groupedChoiceSetIds

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
