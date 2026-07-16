import type { FilterFieldConfig, FilterToolbarOption } from '@rpg/ui'

type CatalogPickerInlineSelectFilterConfig<
  TFilters extends Record<string, unknown>,
  TKey extends keyof TFilters,
> = {
  key: TKey
  label: string
  ariaLabel: string
  triggerAriaLabel: string
  options: FilterToolbarOption[]
  visible?: boolean
}

/** Builds an inline catalog-picker select filter field for `FilterToolbar`. */
export function catalogPickerInlineSelectFilter<
  TFilters extends Record<string, unknown>,
  TKey extends keyof TFilters,
>(config: CatalogPickerInlineSelectFilterConfig<TFilters, TKey>): FilterFieldConfig<TFilters> {
  return {
    key: config.key,
    type: 'select',
    label: config.label,
    ariaLabel: config.ariaLabel,
    triggerAriaLabel: config.triggerAriaLabel,
    labelLayout: 'inline',
    options: config.options,
    visible: config.visible,
    required: true,
  }
}
