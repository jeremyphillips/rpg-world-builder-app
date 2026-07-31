'use client'

import { DataTableFilterRegion } from '@rpg/ui'
import {
  ActiveFilterChips,
  FilterBar,
  FilterChromeProvider,
  resolveActiveFilterChips,
  type FilterBarOrientation,
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
  resetLabel?: string
}

/** Primary-only filter chrome for catalog lists without advanced filter panels. */
export function PrimaryFilterBarRegion<T, TFilters extends Record<string, unknown>>({
  filterSchema,
  filterState,
  onValueChange,
  onReset,
  resetLabel,
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
            resetLabel={resetLabel}
          />
        }
        additionalFiltersOpen={false}
        onAdditionalFiltersOpenChange={() => undefined}
      />
    </FilterChromeProvider>
  )
}

type PrimaryFilterPanelProps<T, TFilters extends Record<string, unknown>> = {
  filterSchema: FilterSchema<T, TFilters>
  filterState: TFilters
  onValueChange: (
    id: FilterFieldId<TFilters>,
    value: TFilters[FilterFieldId<TFilters>] | undefined,
  ) => void
  clearFilterField: (id: FilterFieldId<TFilters>) => void
  resetFilters: () => void
  orientation?: FilterBarOrientation
  showActiveChips?: boolean
}

/** Primary filter panel with optional active chip summaries below the bar. */
export function PrimaryFilterPanel<T, TFilters extends Record<string, unknown>>({
  filterSchema,
  filterState,
  onValueChange,
  clearFilterField,
  resetFilters,
  orientation,
  showActiveChips = true,
}: PrimaryFilterPanelProps<T, TFilters>) {
  const chips = resolveActiveFilterChips(filterSchema, filterState)

  return (
    <FilterChromeProvider>
      <div className="flex flex-col gap-2">
        <DataTableFilterRegion
          primaryFilters={
            <FilterBar
              schema={filterSchema}
              state={filterState}
              onValueChange={onValueChange}
              orientation={orientation}
            />
          }
          additionalFiltersOpen={false}
          onAdditionalFiltersOpenChange={() => undefined}
        />
        {showActiveChips ? (
          <ActiveFilterChips
            chips={chips}
            onClear={(fieldId) => clearFilterField(fieldId as FilterFieldId<TFilters>)}
            onClearAll={resetFilters}
          />
        ) : null}
      </div>
    </FilterChromeProvider>
  )
}
