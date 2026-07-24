'use client'

import { useId } from 'react'

import { cn } from '../lib/utils'
import { CatalogFilterFieldList } from './catalog-filter-fields.client'
import type {
  FilterCatalogLayoutConfig,
  FilterDensity,
  FilterFieldId,
  FilterSchema,
} from './filter-schema.types'
import { catalogFilterControlsVariants } from './catalog-filter-controls.variants'
import { FilterChromeProvider, useOptionalFilterChrome } from './filter-chrome.context'
import { FILTER_DENSITY_DEFAULT } from './filter-bar.variants'

export type CatalogFilterControlsProps<TData, TState extends Record<string, unknown>> = {
  schema: FilterSchema<TData, TState>
  layout: FilterCatalogLayoutConfig<TState>
  state: TState
  data?: readonly TData[]
  disabled?: boolean
  density?: FilterDensity
  idPrefix?: string
  className?: string
  onValueChange: (
    id: FilterFieldId<TState>,
    value: TState[FilterFieldId<TState>] | undefined,
  ) => void
}

function CatalogFilterControlsGroup<TData, TState extends Record<string, unknown>>({
  schema,
  fieldIds,
  state,
  data,
  disabled,
  density,
  idPrefix,
  className,
  onValueChange,
}: CatalogFilterControlsProps<TData, TState> & {
  fieldIds?: FilterFieldId<TState>[]
}) {
  const reactId = useId()
  const resolvedIdPrefix = idPrefix || reactId.replace(/:/g, '')
  const parentChrome = useOptionalFilterChrome()
  const resolvedDensity = density ?? parentChrome?.density ?? FILTER_DENSITY_DEFAULT

  if (!fieldIds || fieldIds.length === 0) {
    return null
  }

  return (
    <FilterChromeProvider density={resolvedDensity}>
      <div className={cn(catalogFilterControlsVariants(), className)}>
        <CatalogFilterFieldList
          schema={schema}
          fieldIds={fieldIds}
          state={state}
          data={data}
          disabled={disabled}
          idPrefix={resolvedIdPrefix}
          onValueChange={onValueChange}
        />
      </div>
    </FilterChromeProvider>
  )
}

export function CatalogFilterControls<TData, TState extends Record<string, unknown>>(
  props: CatalogFilterControlsProps<TData, TState>,
) {
  return (
    <CatalogFilterControlsGroup
      {...props}
      fieldIds={props.layout.primaryFieldIds}
      className={props.className}
    />
  )
}

CatalogFilterControls.Primary = function CatalogFilterControlsPrimary<
  TData,
  TState extends Record<string, unknown>,
>(props: CatalogFilterControlsProps<TData, TState>) {
  return (
    <CatalogFilterControlsGroup
      {...props}
      fieldIds={props.layout.primaryFieldIds}
      className={props.className}
    />
  )
}

CatalogFilterControls.FilterRow = function CatalogFilterControlsFilterRow<
  TData,
  TState extends Record<string, unknown>,
>(props: CatalogFilterControlsProps<TData, TState>) {
  return (
    <CatalogFilterControlsGroup
      {...props}
      fieldIds={props.layout.filterRowFieldIds}
      className={props.className}
    />
  )
}
