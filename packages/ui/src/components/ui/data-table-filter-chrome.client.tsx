'use client'

import { useMemo, type ReactNode } from 'react'

import { countModifiedFilters } from '../../filters/filter-engine'
import { getSchemaFieldsByPlacement } from '../../filters/filter-bar.lib'
import { FilterBar } from '../../filters/filter-bar.client'
import { FilterChromeProvider } from '../../filters/filter-chrome.context'
import { FilterFieldList } from '../../filters/filter-fields.client'
import type { FilterFieldId, FilterSchema } from '../../filters/filter-schema.types'
import {
  prepareDatatableFilterSchemaForRender,
  validateDatatableFilterSchema,
} from '../../filters/validate-datatable-filter-schema'
import {
  DataTableFilterRegion,
  type DataTableFilterRegionLabels,
} from './data-table-filter-region.client'

export type DataTableFilterChromeProps<TData, TFilters extends Record<string, unknown>> = {
  filterSchema: FilterSchema<TData, TFilters>
  state: TFilters
  onValueChange: (
    id: FilterFieldId<TFilters>,
    value: TFilters[FilterFieldId<TFilters>] | undefined,
  ) => void
  onReset: () => void
  advancedOpen: boolean
  onAdvancedFiltersOpenChange: (open: boolean) => void
  resetLabel?: string
  labels?: DataTableFilterRegionLabels
  disabled?: boolean
  trailing?: ReactNode
}

export function DataTableFilterChrome<TData, TFilters extends Record<string, unknown>>({
  filterSchema,
  state,
  onValueChange,
  onReset,
  advancedOpen,
  onAdvancedFiltersOpenChange,
  resetLabel,
  labels,
  disabled,
  trailing,
}: DataTableFilterChromeProps<TData, TFilters>) {
  const renderSchema = useMemo(() => {
    validateDatatableFilterSchema(filterSchema)
    return prepareDatatableFilterSchemaForRender(filterSchema)
  }, [filterSchema])

  const advancedFields = useMemo(
    () => getSchemaFieldsByPlacement(renderSchema, 'advanced'),
    [renderSchema],
  )
  const advancedModifiedCount = countModifiedFilters(filterSchema, state, 'advanced')

  return (
    <FilterChromeProvider density="compact" selectPresentation="floating">
      <DataTableFilterRegion
        labels={labels}
        disabled={disabled}
        primaryFilters={
          <FilterBar
            schema={renderSchema}
            state={state}
            onValueChange={onValueChange}
            onReset={onReset}
            resetLabel={resetLabel}
            disabled={disabled}
            trailing={trailing}
          />
        }
        additionalFilterFields={
          advancedFields.length > 0 ? (
            <FilterFieldList
              schema={renderSchema}
              fields={advancedFields}
              state={state}
              idPrefix="filters-advanced"
              onValueChange={onValueChange}
              disabled={disabled}
            />
          ) : undefined
        }
        additionalFiltersOpen={advancedOpen}
        onAdditionalFiltersOpenChange={onAdvancedFiltersOpenChange}
        activeAdditionalFilterCount={advancedModifiedCount}
      />
    </FilterChromeProvider>
  )
}
