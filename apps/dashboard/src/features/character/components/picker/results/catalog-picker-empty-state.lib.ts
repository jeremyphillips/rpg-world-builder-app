/** Shared empty-state kinds for choice-set catalog pickers (spells, proficiencies). */
export type CatalogPickerEmptyStateKind = 'no-options' | 'selection-full'

export function resolveCatalogPickerEmptyStateKind(args: {
  itemsLength: number
  choiceSetMax: number
  selectedCount: number
}): CatalogPickerEmptyStateKind | undefined {
  if (args.itemsLength > 0) return undefined
  if (args.selectedCount >= args.choiceSetMax) return 'selection-full'
  return 'no-options'
}

export function resolveCatalogPickerEmptyStateMessage(
  kind: CatalogPickerEmptyStateKind | undefined,
  messages: { noOptions: string; selectionFull: string },
): string | undefined {
  switch (kind) {
    case 'no-options':
      return messages.noOptions
    case 'selection-full':
      return messages.selectionFull
    default:
      return undefined
  }
}
