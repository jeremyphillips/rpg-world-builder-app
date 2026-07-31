'use client'

import { RotateCcw } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '../lib/utils'
import { Button } from '../components/ui/button.client'
import { countModifiedFilters } from './filter-engine'
import { getSchemaFieldsByPlacement } from './filter-bar.lib'
import {
  filterBarResetButtonClasses,
  filterBarVariants,
  type FilterBarOrientation,
} from './filter-bar.variants'
import { FilterChromeProvider, useOptionalFilterChrome } from './filter-chrome.context'
import { FilterFieldList } from './filter-fields.client'
import type { FilterFieldId, FilterSchema } from './filter-schema.types'

export type FilterBarProps<TData, TState extends Record<string, unknown>> = {
  schema: FilterSchema<TData, TState>
  state: TState
  onValueChange: (
    id: FilterFieldId<TState>,
    value: TState[FilterFieldId<TState>] | undefined,
  ) => void
  onReset?: () => void
  resetLabel?: string
  disabled?: boolean
  className?: string
  idPrefix?: string
  trailing?: ReactNode
  orientation?: FilterBarOrientation
}

export function FilterBar<TData, TState extends Record<string, unknown>>({
  schema,
  state,
  onValueChange,
  onReset,
  resetLabel = 'Clear filters',
  disabled = false,
  className,
  idPrefix = 'filters',
  trailing,
  orientation = 'horizontal',
}: FilterBarProps<TData, TState>) {
  const parentChrome = useOptionalFilterChrome()
  const primaryFields = getSchemaFieldsByPlacement(schema, 'primary')
  const modifiedCount = countModifiedFilters(schema, state)

  const bar = (
    <div className={cn(filterBarVariants({ orientation }), className)}>
      <FilterFieldList
        schema={schema}
        fields={primaryFields}
        state={state}
        disabled={disabled}
        idPrefix={idPrefix}
        onValueChange={onValueChange}
      />
      {onReset && modifiedCount > 0 ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={filterBarResetButtonClasses}
          disabled={disabled}
          onClick={onReset}
        >
          <RotateCcw aria-hidden className="size-3" />
          {resetLabel}
        </Button>
      ) : null}
      {trailing}
    </div>
  )

  return parentChrome ? bar : <FilterChromeProvider>{bar}</FilterChromeProvider>
}
