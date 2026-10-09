import { resolveFilterFieldPlacement } from './filter-engine'
import { resolveFilterFieldOptions } from './filter-field-options.lib'
import type {
  FilterFieldDef,
  FilterFieldOptionsContext,
  FilterPlacement,
  FilterSchema,
} from './filter-schema.types'
import { FILTER_SELECT_ALL_VALUE } from './filter-bar.variants'

export { resolveFilterControlSize } from './filter-presentation.lib'

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

/** Every label a select trigger must reserve, including the All option. */
export function resolveFilterSelectSizerLabels(field: {
  label: string
  showAllOption?: boolean
  allOptionLabel?: string
  options: readonly { label: string }[]
}): string[] {
  const labels = field.options.map((option) => option.label)
  if (field.showAllOption !== false) {
    labels.unshift(field.allOptionLabel ?? `All ${field.label}`)
  }
  return [...new Set(labels)]
}

/** `triggerLabel(0)` and `triggerLabel(totalOptionCount)` — the popover's width extremes. */
export function resolveFilterPopoverSizerLabels(
  triggerLabel: (activeCount: number) => string,
  totalOptionCount: number,
): string[] {
  return [...new Set([triggerLabel(0), triggerLabel(totalOptionCount)])]
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

export function resolveSelectCurrentValue(rawValue: unknown, effectiveValue: unknown): unknown {
  if (rawValue !== undefined && rawValue !== '') return rawValue
  if (effectiveValue !== undefined && effectiveValue !== '') return effectiveValue
  return undefined
}
