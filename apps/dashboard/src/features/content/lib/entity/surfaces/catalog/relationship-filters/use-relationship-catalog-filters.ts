import { useMemo, useState } from 'react'

import {
  applyFilterSchema,
  countModifiedFilters,
  useFilterState,
  type FilterSchema,
} from '@rpg/ui/filters'

/** Option identity for sanitizing when the row set changes, without tracking schema object identity. */
function relationshipFilterSchemaSignature<TData, TState extends Record<string, unknown>>(
  schema: FilterSchema<TData, TState>,
): string {
  return schema.fields
    .map((field) => {
      if (
        (field.type !== 'select' && field.type !== 'chips') ||
        typeof field.options === 'function'
      ) {
        return field.id
      }
      return `${field.id}:${field.options.map((option) => option.value).join(',')}`
    })
    .join('|')
}

export function useRelationshipCatalogFilters<TData, TState extends Record<string, unknown>>({
  rows,
  schema,
}: {
  rows: readonly TData[]
  schema: FilterSchema<TData, TState>
}) {
  const signature = relationshipFilterSchemaSignature(schema)
  const filters = useFilterState(schema)
  const [prevSignature, setPrevSignature] = useState(signature)

  if (signature !== prevSignature) {
    setPrevSignature(signature)
    filters.sanitize(filters.state)
  }

  const structuredFilterCount = countModifiedFilters(schema, filters.state)
  const filteredRows = useMemo(
    () => applyFilterSchema(schema, filters.state, [...rows]),
    [filters.state, rows, schema],
  )

  return {
    state: filters.state,
    setValue: filters.setValue,
    reset: filters.reset,
    structuredFilterCount,
    filteredRows,
  }
}
