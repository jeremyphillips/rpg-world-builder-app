import { countModifiedFilters } from './filter-engine'
import { getSchemaFieldsByPlacement, isFilterFieldVisible } from './filter-bar.lib'
import type { FilterSchema } from './filter-schema.types'

export function resolveVisibleAdvancedFields<TData, TState extends Record<string, unknown>>(
  schema: FilterSchema<TData, TState>,
  state: TState,
) {
  return getSchemaFieldsByPlacement(schema, 'advanced').filter((field) =>
    isFilterFieldVisible(field, state),
  )
}

export function shouldShowAdvancedPanelClearAll<TData, TState extends Record<string, unknown>>(
  schema: FilterSchema<TData, TState>,
  state: TState,
): boolean {
  return countModifiedFilters(schema, state) > 0
}

export function shouldShowAdvancedPanelHeaderReset(
  showResetOverride: boolean | undefined,
  onReset: (() => void) | undefined,
  modifiedCount: number,
): boolean {
  return showResetOverride ?? Boolean(onReset && modifiedCount > 0)
}
