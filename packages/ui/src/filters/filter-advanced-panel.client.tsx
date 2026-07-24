'use client'

import { Collapsible, CollapsibleContent } from '../components/ui/collapsible.client'
import { Button } from '../components/ui/button.client'
import { cn } from '../lib/utils'
import { countModifiedFilters } from './filter-engine'
import { getSchemaFieldsByPlacement, isFilterFieldVisible } from './filter-bar.lib'
import {
  filterAdvancedPanelFooterVariants,
  filterAdvancedPanelInnerVariants,
  filterAdvancedPanelVariants,
  FILTER_DENSITY_DEFAULT,
} from './filter-bar.variants'
import { FilterChromeProvider, useOptionalFilterChrome } from './filter-chrome.context'
import { FilterFieldList } from './filter-fields.client'
import type { FilterDensity, FilterFieldId, FilterSchema } from './filter-schema.types'

export type FilterAdvancedPanelProps<TData, TState extends Record<string, unknown>> = {
  schema: FilterSchema<TData, TState>
  state: TState
  onValueChange: (
    id: FilterFieldId<TState>,
    value: TState[FilterFieldId<TState>] | undefined,
  ) => void
  open: boolean
  onClearAll?: () => void
  clearAllLabel?: string
  disabled?: boolean
  density?: FilterDensity
  idPrefix?: string
  className?: string
}

export function FilterAdvancedPanel<TData, TState extends Record<string, unknown>>({
  schema,
  state,
  onValueChange,
  open,
  onClearAll,
  clearAllLabel = 'Clear all filters',
  disabled = false,
  density,
  idPrefix = 'filters-advanced',
  className,
}: FilterAdvancedPanelProps<TData, TState>) {
  const parentChrome = useOptionalFilterChrome()
  const resolvedDensity = density ?? parentChrome?.density ?? FILTER_DENSITY_DEFAULT
  const advancedFields = getSchemaFieldsByPlacement(schema, 'advanced').filter((field) =>
    isFilterFieldVisible(field, state),
  )

  if (advancedFields.length === 0) {
    return null
  }

  const modifiedCount = countModifiedFilters(schema, state)

  return (
    <Collapsible open={open} className={className}>
      <CollapsibleContent>
        <FilterChromeProvider density={resolvedDensity}>
          <div className={cn(filterAdvancedPanelVariants())}>
            <div className={filterAdvancedPanelInnerVariants({ density: resolvedDensity })}>
              <FilterFieldList
                schema={schema}
                fields={advancedFields}
                state={state}
                disabled={disabled}
                idPrefix={idPrefix}
                onValueChange={onValueChange}
              />
            </div>

            {onClearAll && modifiedCount > 0 ? (
              <div className={filterAdvancedPanelFooterVariants({ density: resolvedDensity })}>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={disabled}
                  onClick={onClearAll}
                >
                  {clearAllLabel}
                </Button>
              </div>
            ) : null}
          </div>
        </FilterChromeProvider>
      </CollapsibleContent>
    </Collapsible>
  )
}
