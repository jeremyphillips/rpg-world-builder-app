'use client'

import { DataTableFilterRegion } from '@rpg/ui'
import {
  FilterBar,
  FilterChromeProvider,
  type FilterFieldId,
  type FilterSchema,
} from '@rpg/ui/filters'

type PrimaryFilterBarRegionProps<T, TFilters extends Record<string, unknown>> = {
  filterSchema: FilterSchema<T, TFilters>
  filterState: TFilters
  onValueChange: (
    id: FilterFieldId<TFilters>,
    value: TFilters[FilterFieldId<TFilters>] | undefined,
  ) => void
  onReset: () => void
}

/** Primary-only filter chrome for catalog lists without advanced filter panels. */
export function PrimaryFilterBarRegion<T, TFilters extends Record<string, unknown>>({
  filterSchema,
  filterState,
  onValueChange,
  onReset,
}: PrimaryFilterBarRegionProps<T, TFilters>) {
  return (
    <FilterChromeProvider>
      <DataTableFilterRegion
        primaryFilters={
          <FilterBar
            schema={filterSchema}
            state={filterState}
            onValueChange={onValueChange}
            onReset={onReset}
          />
        }
        additionalFiltersOpen={false}
        onAdditionalFiltersOpenChange={() => undefined}
      />
    </FilterChromeProvider>
  )
}
