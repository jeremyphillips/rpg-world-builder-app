'use client'

import { ChevronDown, ChevronUp, Filter, RotateCcw } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '../lib/utils'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button.client'
import { countModifiedFilters } from './filter-engine'
import { getSchemaFieldsByPlacement } from './filter-bar.lib'
import { filterBarFieldGroupVariants, filterBarResetButtonClasses, filterBarVariants } from './filter-bar.variants'
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
  advancedOpen?: boolean
  onAdvancedOpenChange?: (open: boolean) => void
  advancedToggleLabel?: string
  trailing?: ReactNode
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
  advancedOpen = false,
  onAdvancedOpenChange,
  advancedToggleLabel = 'Filters',
  trailing,
}: FilterBarProps<TData, TState>) {
  const primaryFields = getSchemaFieldsByPlacement(schema, 'primary')
  const advancedFields = getSchemaFieldsByPlacement(schema, 'advanced')
  const modifiedCount = countModifiedFilters(schema, state)
  const advancedModifiedCount = countModifiedFilters(schema, state, 'advanced')

  return (
    <div className={cn(filterBarVariants(), className)}>
      <div className={filterBarFieldGroupVariants()}>
        <FilterFieldList
          schema={schema}
          fields={primaryFields}
          state={state}
          disabled={disabled}
          idPrefix={idPrefix}
          onValueChange={onValueChange}
        />
      </div>

      <div className="flex items-center gap-2">
        {advancedFields.length > 0 && onAdvancedOpenChange ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            aria-expanded={advancedOpen}
            className="gap-1.5"
            onClick={() => onAdvancedOpenChange(!advancedOpen)}
          >
            <Filter className="size-3.5" aria-hidden />
            {advancedToggleLabel}
            {advancedModifiedCount > 0 ? (
              <Badge appearance="neutral" tone="neutral" size="sm" className="ml-0.5">
                {advancedModifiedCount}
              </Badge>
            ) : null}
            {advancedOpen ? (
              <ChevronUp className="size-3.5 opacity-60" aria-hidden />
            ) : (
              <ChevronDown className="size-3.5 opacity-60" aria-hidden />
            )}
          </Button>
        ) : null}

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
    </div>
  )
}
