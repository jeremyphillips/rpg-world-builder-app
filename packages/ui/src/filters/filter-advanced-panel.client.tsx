'use client'

import { Collapsible, CollapsibleContent } from '../components/ui/collapsible.client'
import { Button } from '../components/ui/button.client'
import { cn } from '../lib/utils'
import { countModifiedFilters } from './filter-engine'
import {
  getSchemaFieldsByPlacement,
  isFilterFieldVisible,
  resolveAdvancedPanelColumns,
} from './filter-bar.lib'
import {
  filterAdvancedPanelInnerVariants,
  filterAdvancedPanelVariants,
} from './filter-bar.variants'
import { FilterFieldList } from './filter-fields.client'
import type { FilterFieldId, FilterSchema } from './filter-schema.types'

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
  idPrefix = 'filters-advanced',
  className,
}: FilterAdvancedPanelProps<TData, TState>) {
  const advancedFields = getSchemaFieldsByPlacement(schema, 'advanced').filter((field) =>
    isFilterFieldVisible(field, state),
  )

  if (advancedFields.length === 0) {
    return null
  }

  const modifiedCount = countModifiedFilters(schema, state)
  const columnCount = resolveAdvancedPanelColumns(advancedFields.length)

  return (
    <Collapsible open={open} className={className}>
      <CollapsibleContent>
        <div className={cn(filterAdvancedPanelVariants())}>
          <div className={filterAdvancedPanelInnerVariants({ cols: columnCount })}>
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
            <div className="border-t border-border px-4 py-3">
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
      </CollapsibleContent>
    </Collapsible>
  )
}
