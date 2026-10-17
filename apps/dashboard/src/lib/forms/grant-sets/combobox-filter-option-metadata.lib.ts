import type { ComboboxFilterDimensionConfig, FieldOption } from '@rpg/ui/form'

/** Ensures every option exposes metadata for each active combobox filter dimension. */
export function assertComboboxOptionsMatchFilterDimensions(
  options: readonly FieldOption[],
  filterSelects: readonly ComboboxFilterDimensionConfig[],
): void {
  if (filterSelects.length === 0) return

  const filterKeys = filterSelects.map((dimension) => dimension.filterKey)

  for (const option of options) {
    for (const filterKey of filterKeys) {
      const value = option.filterValues?.[filterKey]
      if (value === undefined || value === '') {
        throw new Error(
          `Option "${option.value}" is missing filterValues.${filterKey} required by filterSelects`,
        )
      }
    }
  }
}
