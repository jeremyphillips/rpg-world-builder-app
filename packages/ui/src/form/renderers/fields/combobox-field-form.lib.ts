import { filterOptions } from '../../../components/ui/combobox-field.lib'
import type { ComboboxFieldOption } from '../../../components/ui/combobox-field.types'
import {
  COMBOBOX_FILTER_ALL_VALUE,
  type ComboboxFieldConfig,
  type FieldOption,
} from '../../field-config'

/** Maps form-layer options to combobox panel options. */
export function toComboboxFieldOptions(options: FieldOption[]): ComboboxFieldOption[] {
  return options.map(({ description, classification, filterCategory, ...option }) => ({
    ...option,
    ...(description !== undefined ? { metadata: description } : {}),
    ...(classification !== undefined ? { classification } : {}),
    ...(filterCategory !== undefined ? { filterCategory } : {}),
  }))
}

/** Maps combobox panel options back to form-layer options. */
export function toFieldOptions(options: ComboboxFieldOption[]): FieldOption[] {
  return options.map(({ metadata, classification, filterCategory, ...option }) => ({
    ...option,
    ...(metadata !== undefined ? { description: metadata } : {}),
    ...(classification !== undefined ? { classification } : {}),
    ...(filterCategory !== undefined ? { filterCategory } : {}),
  }))
}

export function resolveComboboxFilterDefaultValue(
  filterSelect: NonNullable<ComboboxFieldConfig['filterSelect']>,
): string {
  return filterSelect.defaultValue ?? filterSelect.options[0]?.value ?? COMBOBOX_FILTER_ALL_VALUE
}

/** Keeps selected values visible when a category filter is active. */
export function filterComboboxOptionsByCategory(
  options: ComboboxFieldOption[],
  category: string,
  selected: string[],
): ComboboxFieldOption[] {
  if (category === COMBOBOX_FILTER_ALL_VALUE) return options

  const selectedSet = new Set(selected)
  return options.filter(
    (option) => selectedSet.has(option.value) || option.filterCategory === category,
  )
}

export function composeComboboxResolveFilteredOptions(
  category: string,
  userResolver: ComboboxFieldConfig['resolveFilteredOptions'],
): ComboboxFieldConfig['resolveFilteredOptions'] {
  return (options, query, selected) => {
    const comboboxOptions = toComboboxFieldOptions(options)
    const categoryFiltered = filterComboboxOptionsByCategory(comboboxOptions, category, selected)

    if (userResolver) {
      return userResolver(toFieldOptions(categoryFiltered), query, selected)
    }

    return toFieldOptions(filterOptions(categoryFiltered, query, selected))
  }
}
