export function focusNextOverviewRowActionTrigger(input: {
  removedRowId: string
  visibleRowIds: readonly string[]
  actionTriggerRefs: ReadonlyMap<string, HTMLButtonElement>
  tableRoot: HTMLDivElement | null
}): void {
  const removedIndex = input.visibleRowIds.indexOf(input.removedRowId)
  const candidateIds = [
    ...input.visibleRowIds.slice(removedIndex + 1),
    ...input.visibleRowIds.slice(0, removedIndex).reverse(),
  ]

  for (const candidateId of candidateIds) {
    const trigger = input.actionTriggerRefs.get(candidateId)
    if (trigger) {
      trigger.focus()
      return
    }
  }

  input.tableRoot?.focus()
}
