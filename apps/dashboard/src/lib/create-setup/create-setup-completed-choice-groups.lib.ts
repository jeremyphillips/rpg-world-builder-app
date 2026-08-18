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

/** True when every declared id is visible, complete, and collapsed. */
export function isCreateSetupGroupedChoiceSummaryReady(args: {
  groupedChoiceSetIds: readonly string[]
  visibleSetIds: readonly string[]
  isCollapsedComplete: (setId: string) => boolean
}): boolean {
  if (args.groupedChoiceSetIds.length < 2) {
    return false
  }

  return args.groupedChoiceSetIds.every((setId) =>
    isCreateSetupSetCollapsedComplete({
      setId,
      visibleSetIds: args.visibleSetIds,
      isCollapsedComplete: args.isCollapsedComplete,
    }),
  )
}

export function resolveCreateSetupGroupedChoiceRows(args: {
  groupedChoiceSetIds: readonly string[]
  setById: ReadonlyMap<string, CreateSetupChoiceSet | undefined>
}): CreateSetupGroupedChoiceRow[] {
  return args.groupedChoiceSetIds.flatMap((setId) => {
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
