import { resolveFilterFieldPlacement } from './filter-engine'
import type {
  FilterFieldDef,
  FilterPlacement,
  FilterSchema,
} from './filter-schema.types'
import { FILTER_SELECT_ALL_VALUE } from './filter-bar.variants'

type SelectFieldLike = {
  showAllOption?: boolean
  defaultValue?: unknown
  options: ReadonlyArray<{ value: string; label: string }>
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

export function resolveAdvancedPanelColumns(fieldCount: number): 1 | 2 | 3 | 4 {
  if (fieldCount <= 1) return 1
  if (fieldCount === 2) return 2
  if (fieldCount === 3) return 3
  return 4
}
