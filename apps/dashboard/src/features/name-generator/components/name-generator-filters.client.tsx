'use client'

import { FilterToolbar } from '@rpg/ui'
import { useMemo } from 'react'

import { buildNameGeneratorFilterFields } from '../model/name-generator-filter-fields'
import type {
  NameGeneratorFilterOptions,
  NameGeneratorFilters,
  NameGeneratorVisibleFilters,
} from '../model/name-generator-filters'

export type NameGeneratorFiltersProps = {
  filters: NameGeneratorFilters
  filterOptions: NameGeneratorFilterOptions
  visibleFilters: NameGeneratorVisibleFilters
  disabled?: boolean
  onFilterChange: (key: keyof NameGeneratorFilters, value: string | undefined) => void
  onResetFilters: () => void
}

export function NameGeneratorFilters({
  filters,
  filterOptions,
  visibleFilters,
  disabled = false,
  onFilterChange,
  onResetFilters,
}: NameGeneratorFiltersProps) {
  const fields = useMemo(
    () => buildNameGeneratorFilterFields({ filterOptions, visibleFilters }),
    [filterOptions, visibleFilters],
  )

  return (
    <FilterToolbar
      idPrefix="name-generator"
      fields={fields}
      values={filters}
      disabled={disabled}
      onValueChange={onFilterChange}
      onReset={onResetFilters}
    />
  )
}
