export type CatalogPickerSortOption<TMode extends string = string> = {
  value: TMode
  label: string
  triggerLabel?: string
}

const NAME_ASC_LABEL = 'Name: A–Z'
const NAME_DESC_LABEL = 'Name: Z–A'
const NAME_ASC_LEGACY = 'Name (A–Z)'
const NAME_DESC_LEGACY = 'Name (Z–A)'

export function resolvePickerSortTriggerLabel(
  option: Pick<CatalogPickerSortOption, 'label' | 'triggerLabel'>,
): string {
  if (option.triggerLabel) return option.triggerLabel
  if (option.label === NAME_ASC_LABEL || option.label === NAME_ASC_LEGACY) return 'A–Z'
  if (option.label === NAME_DESC_LABEL || option.label === NAME_DESC_LEGACY) return 'Z–A'
  return option.label
}

export function pickerSortOption<TMode extends string>(
  value: TMode,
  label: string,
  triggerLabel?: string,
): CatalogPickerSortOption<TMode> {
  return { value, label, triggerLabel }
}
