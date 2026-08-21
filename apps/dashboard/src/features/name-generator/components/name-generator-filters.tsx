import { FilterBar, setFilterValue, type FilterSchema } from '@rpg/ui/filters'
import { useMemo } from 'react'

import type { GeneratedName } from '@rpg/contracts/name-generator'

import type { NameGeneratorFilters } from '../model/name-generator-filters'

export type NameGeneratorFiltersProps = {
  schema: FilterSchema<GeneratedName, NameGeneratorFilters>
  filters: NameGeneratorFilters
  disabled?: boolean
  onFilterChange: (filters: NameGeneratorFilters) => void
  onResetFilters: () => void
}

export function NameGeneratorFilters({
  schema,
  filters,
  disabled = false,
  onFilterChange,
  onResetFilters,
}: NameGeneratorFiltersProps) {
  const handleValueChange = useMemo(
    () =>
      (
        id: keyof NameGeneratorFilters,
        value: NameGeneratorFilters[keyof NameGeneratorFilters] | undefined,
      ) => {
        onFilterChange(setFilterValue(schema, filters, id, value))
      },
    [filters, onFilterChange, schema],
  )

  return (
    <FilterBar
      schema={schema}
      state={filters}
      disabled={disabled}
      idPrefix="name-generator"
      resetLabel="Reset filters"
      onValueChange={handleValueChange}
      onReset={onResetFilters}
    />
  )
}
