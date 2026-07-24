import { resolveFilterFieldPlacement } from './filter-engine'
import { resolveFilterFieldOptions } from './filter-field-options.lib'
import type {
  FilterFieldDef,
  FilterFieldOptionsContext,
  FilterPlacement,
  FilterSchema,
} from './filter-schema.types'
import type { FilterDensity } from './filter-schema.types'
import { FILTER_DENSITY_DEFAULT, FILTER_SELECT_ALL_VALUE } from './filter-bar.variants'

type SelectFieldLike = {
  showAllOption?: boolean
  defaultValue?: unknown
  options: ReadonlyArray<{ value: string; label: string }>
}

export function resolveSelectFieldOptions<TData, TState extends Record<string, unknown>>(
  field: Extract<FilterFieldDef<TData, TState>, { type: 'select' }>,
  ctx: FilterFieldOptionsContext<TData, TState>,
): ReadonlyArray<{ value: string; label: string }> {
  return resolveFilterFieldOptions(field, ctx)
}

export function getSchemaFieldsByPlacement<TData, TState extends Record<string, unknown>>(
  schema: FilterSchema<TData, TState>,
  placement: FilterPlacement,
): FilterFieldDef<TData, TState>[] {
  return schema.fields.filter((field) => resolveFilterFieldPlacement(field) === placement)
}

export function isFilterFieldVisible<TData, TState extends Record<string, unknown>>(
  field: FilterFieldDef<TData, TState>,
  state: TState,
): boolean {
  return field.visible ? field.visible(state) : true
}

export function isFilterFieldDisabled<TData, TState extends Record<string, unknown>>(
  field: FilterFieldDef<TData, TState>,
  state: TState,
  disabled = false,
): boolean {
  if (disabled) return true
  return field.disabled ? field.disabled(state) : false
}

export function resolveFilterSelectValue(
  field: SelectFieldLike,
  rawValue: unknown,
  effectiveValue: unknown,
): string {
  if (rawValue !== undefined && rawValue !== '') {
    return String(rawValue)
  }

  if (effectiveValue !== undefined && effectiveValue !== '') {
    return String(effectiveValue)
  }

  if (field.showAllOption !== false) {
    return FILTER_SELECT_ALL_VALUE
  }

  if (field.defaultValue !== undefined) {
    return String(field.defaultValue)
  }

  return field.options[0]?.value ?? ''
}

export function normalizeFilterSelectChange(field: SelectFieldLike, nextValue: string): unknown {
  if (field.showAllOption !== false && nextValue === FILTER_SELECT_ALL_VALUE) {
    return undefined
  }

  return nextValue
}

export function resolveFilterControlSize(
  density: FilterDensity = FILTER_DENSITY_DEFAULT,
): 'sm' | 'md' {
  return density === 'compact' ? 'sm' : 'md'
}

export function resolveSelectCurrentValue(rawValue: unknown, effectiveValue: unknown): unknown {
  if (rawValue !== undefined && rawValue !== '') return rawValue
  if (effectiveValue !== undefined && effectiveValue !== '') return effectiveValue
  return undefined
}

export function shouldSkipFilterSelectChange(
  normalized: unknown,
  rawValue: unknown,
  effectiveValue: unknown,
): boolean {
  return Object.is(normalized, resolveSelectCurrentValue(rawValue, effectiveValue))
}
