import { FILTER_TOOLBAR_ANY_VALUE } from './filter-toolbar.variants'
import type { SelectFilterFieldConfig } from './filter-toolbar.types'

export function resolveFilterToolbarSelectValue<TFilters extends Record<string, unknown>>(
  field: SelectFilterFieldConfig<TFilters>,
  rawValue: TFilters[SelectFilterFieldConfig<TFilters>['key']] | undefined,
): string {
  if (rawValue != null && rawValue !== '') {
    return String(rawValue)
  }

  if (field.allowAny) {
    return FILTER_TOOLBAR_ANY_VALUE
  }

  return field.options[0]?.value ?? ''
}

export function normalizeFilterToolbarSelectChange<TFilters extends Record<string, unknown>>(
  field: SelectFilterFieldConfig<TFilters>,
  nextValue: string,
): TFilters[SelectFilterFieldConfig<TFilters>['key']] | undefined {
  if (field.allowAny && nextValue === FILTER_TOOLBAR_ANY_VALUE) {
    return undefined
  }

  return nextValue as TFilters[SelectFilterFieldConfig<TFilters>['key']]
}

export function resolveFilterToolbarPlaceholder<TFilters extends Record<string, unknown>>(
  field: Pick<SelectFilterFieldConfig<TFilters>, 'placeholder' | 'allowAny' | 'anyLabel'>,
): string | undefined {
  return field.placeholder ?? (field.allowAny ? (field.anyLabel ?? 'Any') : undefined)
}
