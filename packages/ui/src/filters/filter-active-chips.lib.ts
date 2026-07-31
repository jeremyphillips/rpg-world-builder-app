import { getEffectiveFilterValue, isFilterModified } from './filter-engine'
import type {
  ActiveFilterChip,
  ActiveChipSummaryContext,
  FilterFieldDef,
  FilterFieldId,
  FilterFieldOptionsContext,
  FilterSchema,
} from './filter-schema.types'

export type { ActiveFilterChip, ActiveChipSummaryContext } from './filter-schema.types'

function resolveFieldOptions<TData, TState extends Record<string, unknown>>(
  field: Extract<FilterFieldDef<TData, TState>, { type: 'select' | 'chips' }>,
  ctx: ActiveChipSummaryContext<TData, TState>,
): Array<{ value: string; label: string }> {
  if (typeof field.options === 'function') {
    const optionsContext: FilterFieldOptionsContext<TData, TState> = {
      state: ctx.state,
      data: ctx.data,
    }
    return field.options(optionsContext)
  }

  return field.options
}

function formatMultiValueLabel(labels: string[]): string {
  if (labels.length === 0) return ''
  if (labels.length <= 2) return labels.join(', ')
  return `${labels.slice(0, 2).join(', ')} +${labels.length - 2}`
}

function resolveBooleanChipSummary<TData, TState extends Record<string, unknown>>(
  field: Extract<FilterFieldDef<TData, TState>, { type: 'boolean' }>,
  value: unknown,
): ActiveFilterChip | null {
  if (value !== true) return null
  return { fieldId: field.id, label: field.label, valueLabel: '' }
}

function resolveSelectChipSummary<TData, TState extends Record<string, unknown>>(
  field: Extract<FilterFieldDef<TData, TState>, { type: 'select' }>,
  value: unknown,
  ctx: ActiveChipSummaryContext<TData, TState>,
): ActiveFilterChip | null {
  if (typeof value !== 'string') return null
  const option = resolveFieldOptions(field, ctx).find((candidate) => candidate.value === value)
  if (!option) return null
  return { fieldId: field.id, label: field.label, valueLabel: option.label }
}

function resolveChipFieldSummary<TData, TState extends Record<string, unknown>>(
  field: Extract<FilterFieldDef<TData, TState>, { type: 'chips' }>,
  value: unknown,
  ctx: ActiveChipSummaryContext<TData, TState>,
): ActiveFilterChip | null {
  const chipValues =
    field.toChipValues?.(value as TState[FilterFieldId<TState>] | undefined) ??
    (Array.isArray(value) ? value.map(String) : typeof value === 'string' ? [value] : [])

  if (chipValues.length === 0) return null

  const options = resolveFieldOptions(field, ctx)
  const labels = chipValues
    .map((chipValue) => options.find((option) => option.value === chipValue)?.label ?? chipValue)
    .filter(Boolean)

  return {
    fieldId: field.id,
    label: field.label,
    valueLabel: formatMultiValueLabel(labels),
  }
}

function resolveDefaultChipSummary<TData, TState extends Record<string, unknown>>(
  ctx: ActiveChipSummaryContext<TData, TState>,
): ActiveFilterChip | null {
  const { field, value } = ctx

  switch (field.type) {
    case 'boolean':
      return resolveBooleanChipSummary(field, value)
    case 'select':
      return resolveSelectChipSummary(field, value, ctx)
    case 'chips':
      return resolveChipFieldSummary(field, value, ctx)
    default:
      return null
  }
}

/** Resolves data-only active filter chips for modified (non-default) fields. */
export function resolveActiveFilterChips<TData, TState extends Record<string, unknown>>(
  schema: FilterSchema<TData, TState>,
  state: TState,
  context?: { data?: readonly TData[] },
): ActiveFilterChip[] {
  const chips: ActiveFilterChip[] = []

  for (const field of schema.fields) {
    if (!isFilterModified(schema, state, field.id)) continue

    const value = getEffectiveFilterValue(schema, state, field.id)
    const summaryContext: ActiveChipSummaryContext<TData, TState> = {
      field,
      value,
      state,
      data: context?.data,
    }

    if (field.activeChip?.include === false) continue

    if (field.activeChip?.resolveSummary) {
      const summary = field.activeChip.resolveSummary(summaryContext)
      if (summary) chips.push(summary)
      continue
    }

    const summary = resolveDefaultChipSummary(summaryContext)
    if (summary) chips.push(summary)
  }

  return chips
}
