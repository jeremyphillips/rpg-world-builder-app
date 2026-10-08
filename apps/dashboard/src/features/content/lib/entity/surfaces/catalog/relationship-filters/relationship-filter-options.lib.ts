import type { FilterCatalogLayoutConfig, FilterSchema } from '@rpg/ui/filters'

export function relationshipCatalogFilterHasBand<TData, TState extends Record<string, unknown>>(
  band: 'primary' | 'filterRow',
  schema: FilterSchema<TData, TState>,
  layout: FilterCatalogLayoutConfig<TState>,
): boolean {
  const fieldIds = band === 'primary' ? layout.primaryFieldIds : layout.filterRowFieldIds
  const present = new Set(schema.fields.map((field) => field.id))
  return Boolean(fieldIds?.some((fieldId) => present.has(fieldId)))
}

/** Values that appear on the current rows, in vocabulary order, plus any unknown extras. */
export function presentFilterValuesInOrder(
  order: readonly string[],
  present: ReadonlySet<string>,
): string[] {
  const ordered = order.filter((id) => present.has(id))
  const extras = [...present].filter((id) => !order.includes(id)).sort()
  return [...ordered, ...extras]
}

export function collectPresentValues<TData>(
  rows: readonly TData[],
  getValue: (row: TData) => string | undefined,
): Set<string> {
  const present = new Set<string>()
  for (const row of rows) {
    const value = getValue(row)
    if (value) present.add(value)
  }
  return present
}
