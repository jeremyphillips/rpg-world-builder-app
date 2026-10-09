export type CatalogPickerSortOption<TMode extends string = string> = {
  value: TMode
  label: string
  triggerLabel: string
}

export function pickerSortOption<TMode extends string>(
  value: TMode,
  label: string,
  triggerLabel: string,
): CatalogPickerSortOption<TMode> {
  return { value, label, triggerLabel }
}

export function buildCatalogSortOptions<TMode extends string>(
  modes: readonly TMode[],
  labels: Record<TMode, string>,
  triggerLabels: Record<TMode, string>,
): CatalogPickerSortOption<TMode>[] {
  return modes.map((mode) => pickerSortOption(mode, labels[mode], triggerLabels[mode]))
}
