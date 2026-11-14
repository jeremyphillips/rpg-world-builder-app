import type {
  FieldOption,
  FieldOptionAvailability,
  SelectFieldOptionListItem,
} from './field-options'
import { flattenSelectFieldOptions, isFieldOptionGroup } from './field-options'
import type { SelectFieldConfig } from './choice-fields.types'

/** Applies `optionAvailability` to a flat option list without mutating the source. */
export function applyOptionAvailabilityToFieldOptions(
  options: readonly FieldOption[],
  availability: FieldOptionAvailability,
  values: Record<string, unknown>,
): FieldOption[] {
  return options.map((option) => ({
    ...option,
    disabled: Boolean(option.disabled) || !availability.enabledWhen(values, option.value),
  }))
}

/** Applies `optionAvailability` to select options, including grouped sections. */
export function applyOptionAvailabilityToSelectOptions(
  options: readonly SelectFieldOptionListItem[],
  availability: FieldOptionAvailability,
  values: Record<string, unknown>,
): SelectFieldOptionListItem[] {
  return options.map((item) =>
    isFieldOptionGroup(item)
      ? {
          ...item,
          options: applyOptionAvailabilityToFieldOptions(item.options, availability, values),
        }
      : applyOptionAvailabilityToFieldOptions([item], availability, values)[0]!,
  )
}

/** Resolves a select field's option list, applying dynamic resolution when configured. */
export function resolveSelectFieldConfigOptions(
  config: SelectFieldConfig,
  values: Record<string, unknown>,
): SelectFieldOptionListItem[] {
  if (config.optionsResolve) {
    return [...config.optionsResolve.optionsWhen(values)]
  }
  return config.options ?? []
}

/** Applies a flat-option filter inside groups and drops groups that become empty. */
export function filterSelectFieldOptionList(
  options: readonly SelectFieldOptionListItem[],
  filter: (options: FieldOption[]) => FieldOption[],
): SelectFieldOptionListItem[] {
  const next: SelectFieldOptionListItem[] = []
  for (const item of options) {
    if (isFieldOptionGroup(item)) {
      const groupOptions = filter(item.options)
      if (groupOptions.length === 0) continue
      next.push({ ...item, options: groupOptions })
      continue
    }
    const [option] = filter([item])
    if (option) next.push(option)
  }
  return next
}

/** Resolves a select field's flat option list after dynamic resolution, availability, and array filters. */
export function resolveSelectFieldFlatOptions(
  config: SelectFieldConfig,
  optionValues: Record<string, unknown>,
  arrayFilter?: (options: FieldOption[], fieldName: string) => FieldOption[],
  dynamicValues: Record<string, unknown> = optionValues,
): FieldOption[] {
  let options = flattenSelectFieldOptions(resolveSelectFieldConfigOptions(config, dynamicValues))
  if (config.optionAvailability) {
    options = applyOptionAvailabilityToFieldOptions(
      options,
      config.optionAvailability,
      optionValues,
    )
  }
  if (arrayFilter) {
    options = arrayFilter(options, config.name)
  }
  return options
}

export function isSelectFieldReadOnly(
  config: SelectFieldConfig,
  resolvedOptions: FieldOption[],
): boolean {
  return config.presentation?.readOnlyWhen?.({ options: resolvedOptions }) ?? false
}

/** Label for the current select value; falls back to the sole option when read-only. */
export function resolveSelectFieldDisplayLabel(
  value: unknown,
  options: FieldOption[],
): string | undefined {
  const normalized = value != null && value !== '' ? String(value) : undefined
  if (normalized) {
    const match = options.find((option) => option.value === normalized)
    if (match) return match.label
  }
  if (options.length === 1) return options[0]?.label
  return normalized
}

/** Option label for a stored value; omits raw ids when no option matches (Change mode). */
export function resolveSelectFieldOptionLabel(
  value: unknown,
  options: FieldOption[],
): string | undefined {
  const normalized = value != null && value !== '' ? String(value) : undefined
  if (!normalized) return undefined
  return options.find((option) => option.value === normalized)?.label
}
