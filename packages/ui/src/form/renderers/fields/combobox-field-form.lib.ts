import { filterOptions } from '../../../components/ui/combobox-field.lib'
import { FILTER_SELECT_ALL_VALUE as COMBOBOX_DIMENSION_SELECT_ALL_VALUE } from '../../../filters/filter-bar.variants'
import type { ComboboxFieldOption } from '../../../components/ui/combobox-field.types'
import {
  COMBOBOX_FILTER_ALL_VALUE,
  type ActiveDimensionFilters,
  type ComboboxFieldConfig,
  type ComboboxFilterDimensionConfig,
  type FieldOption,
  type FilterDimensionValue,
} from '../../field-config'

export { COMBOBOX_DIMENSION_SELECT_ALL_VALUE }

/** Maps form-layer options to combobox panel options. */
export function toComboboxFieldOptions(options: FieldOption[]): ComboboxFieldOption[] {
  return options.map(
    ({ description, classification, filterCategory, filterValues, disabledReason, ...option }) => ({
      ...option,
      ...(disabledReason !== undefined ? { disabledReason } : {}),
      ...(description !== undefined ? { metadata: description } : {}),
      ...(classification !== undefined ? { classification } : {}),
      ...(filterValues !== undefined
        ? { filterValues }
        : filterCategory !== undefined
          ? { filterCategory, filterValues: { category: filterCategory } }
          : {}),
    }),
  )
}

/** Maps combobox panel options back to form-layer options. */
export function toFieldOptions(options: ComboboxFieldOption[]): FieldOption[] {
  return options.map(
    ({ metadata, classification, filterCategory, filterValues, disabledReason, ...option }) => ({
      ...option,
      ...(disabledReason !== undefined ? { disabledReason } : {}),
      ...(metadata !== undefined ? { description: metadata } : {}),
      ...(classification !== undefined ? { classification } : {}),
      ...(filterValues !== undefined ? { filterValues } : {}),
      ...(filterCategory !== undefined ? { filterCategory } : {}),
    }),
  )
}

export function dimensionValueToSelectValue(value: FilterDimensionValue): string {
  return value ?? COMBOBOX_DIMENSION_SELECT_ALL_VALUE
}

export function selectValueToDimensionValue(value: string): FilterDimensionValue {
  return value === COMBOBOX_DIMENSION_SELECT_ALL_VALUE ? undefined : value
}

function resolveOptionFilterValues(
  option: ComboboxFieldOption,
): Readonly<Record<string, string>> | undefined {
  if (option.filterValues) return option.filterValues
  if (option.filterCategory !== undefined) return { category: option.filterCategory }
  return undefined
}

function validateDimensionDefault(
  config: ComboboxFilterDimensionConfig,
): FilterDimensionValue | undefined {
  const { defaultValue } = config
  if (defaultValue === undefined) return undefined
  const allowed = config.options.some((option) => option.value === defaultValue)
  return allowed ? defaultValue : undefined
}

/** Reconciles persisted toolbar state when dimension configs change (dynamic fields). */
export function reconcileActiveDimensionFilters(
  prev: ActiveDimensionFilters,
  dimensionConfigs: readonly ComboboxFilterDimensionConfig[],
): ActiveDimensionFilters {
  const next: Record<string, FilterDimensionValue> = {}

  for (const config of dimensionConfigs) {
    const allowed = new Set(config.options.map((option) => option.value))
    const fallback = validateDimensionDefault(config)
    const prevValue = prev[config.filterKey]

    if (prevValue === undefined) {
      next[config.filterKey] = fallback
      continue
    }

    next[config.filterKey] = allowed.has(prevValue) ? prevValue : fallback
  }

  return next
}

export function resolveInitialActiveDimensionFilters(
  dimensionConfigs: readonly ComboboxFilterDimensionConfig[],
): ActiveDimensionFilters {
  return reconcileActiveDimensionFilters({}, dimensionConfigs)
}

/** AND across defined dimension keys; selected slugs always remain visible. */
export function filterComboboxOptionsByActiveFilters(
  options: ComboboxFieldOption[],
  active: ActiveDimensionFilters,
  selected: string[],
): ComboboxFieldOption[] {
  const activeEntries = Object.entries(active).filter(
    (entry): entry is [string, string] => entry[1] !== undefined,
  )
  if (activeEntries.length === 0) return options

  const selectedSet = new Set(selected)

  return options.filter((option) => {
    if (selectedSet.has(option.value)) return true

    const filterValues = resolveOptionFilterValues(option)
    if (!filterValues) return false

    return activeEntries.every(([key, slug]) => filterValues[key] === slug)
  })
}

export function resolveComboboxFilterDefaultValue(
  filterSelect: NonNullable<ComboboxFieldConfig['filterSelect']>,
): string {
  return filterSelect.defaultValue ?? filterSelect.options[0]?.value ?? COMBOBOX_FILTER_ALL_VALUE
}

/** @deprecated Legacy single-dimension category filter. */
export function filterComboboxOptionsByCategory(
  options: ComboboxFieldOption[],
  category: string,
  selected: string[],
): ComboboxFieldOption[] {
  const active: ActiveDimensionFilters = category === COMBOBOX_FILTER_ALL_VALUE ? {} : { category }
  return filterComboboxOptionsByActiveFilters(options, active, selected)
}

export function composeComboboxResolveFilteredOptionsFromActive(
  active: ActiveDimensionFilters,
  userResolver: ComboboxFieldConfig['resolveFilteredOptions'],
): ComboboxFieldConfig['resolveFilteredOptions'] {
  return (options, query, selected) => {
    const comboboxOptions = toComboboxFieldOptions(options)
    const dimensionFiltered = filterComboboxOptionsByActiveFilters(
      comboboxOptions,
      active,
      selected,
    )

    if (userResolver) {
      return userResolver(toFieldOptions(dimensionFiltered), query, selected)
    }

    return toFieldOptions(filterOptions(dimensionFiltered, query, selected))
  }
}

/** @deprecated Legacy single-dimension compose helper. */
export function composeComboboxResolveFilteredOptions(
  category: string,
  userResolver: ComboboxFieldConfig['resolveFilteredOptions'],
): ComboboxFieldConfig['resolveFilteredOptions'] {
  const active: ActiveDimensionFilters = category === COMBOBOX_FILTER_ALL_VALUE ? {} : { category }
  return composeComboboxResolveFilteredOptionsFromActive(active, userResolver)
}

export function resolveComboboxDimensionAllOptionLabel(
  config: ComboboxFilterDimensionConfig,
): string {
  if (config.allOptionLabel) return config.allOptionLabel
  return `All ${config.ariaLabel.replace(/^Filter by /i, '').toLowerCase()}`
}
