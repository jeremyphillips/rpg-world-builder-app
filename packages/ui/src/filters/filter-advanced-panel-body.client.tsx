'use client'

import type { ReactNode } from 'react'

import { Button } from '../components/ui/button.client'
import { cn } from '../lib/utils'
import { countModifiedFilters } from './filter-engine'
import {
  filterAdvancedPanelFooterVariants,
  filterAdvancedPanelInnerVariants,
  filterAdvancedPanelVariants,
} from './filter-bar.variants'
import { FilterAdvancedPanelHeader } from './filter-advanced-panel-header.client'
import type { FilterAdvancedPanelHeaderProps } from './filter-advanced-panel-header.client'
import {
  resolveVisibleAdvancedFields,
  shouldShowAdvancedPanelClearAll,
  shouldShowAdvancedPanelHeaderReset,
} from './filter-advanced-panel.lib'
import { FilterFieldList } from './filter-fields.client'
import type { FilterDensity, FilterFieldId, FilterSchema } from './filter-schema.types'

type FilterAdvancedPanelBodyProps<
  TData,
  TState extends Record<string, unknown>,
> = FilterAdvancedPanelHeaderProps & {
  schema?: FilterSchema<TData, TState>
  state?: TState
  onValueChange?: (
    id: FilterFieldId<TState>,
    value: TState[FilterFieldId<TState>] | undefined,
  ) => void
  children?: ReactNode
  onClearAll?: () => void
  clearAllLabel?: string
  disabled?: boolean
  idPrefix?: string
  density: FilterDensity
}

function FilterAdvancedPanelFields<TData, TState extends Record<string, unknown>>({
  schema,
  state,
  onValueChange,
  children,
  disabled,
  idPrefix = 'filters-advanced',
}: Pick<
  FilterAdvancedPanelBodyProps<TData, TState>,
  'schema' | 'state' | 'onValueChange' | 'children' | 'disabled' | 'idPrefix'
>) {
  if (children != null) return children
  if (!schema || !state || !onValueChange) return null

  return (
    <FilterFieldList
      schema={schema}
      fields={resolveVisibleAdvancedFields(schema, state)}
      state={state}
      disabled={disabled}
      idPrefix={idPrefix}
      onValueChange={onValueChange}
    />
  )
}

export function FilterAdvancedPanelBody<TData, TState extends Record<string, unknown>>({
  schema,
  state,
  onValueChange,
  children,
  onClearAll,
  clearAllLabel = 'Clear all filters',
  disabled = false,
  density,
  idPrefix = 'filters-advanced',
  showReset: showResetOverride,
  onReset,
  ...headerProps
}: FilterAdvancedPanelBodyProps<TData, TState>) {
  const modifiedCount = schema && state ? countModifiedFilters(schema, state, 'advanced') : 0

  return (
    <div className={cn(filterAdvancedPanelVariants())}>
      <FilterAdvancedPanelHeader
        {...headerProps}
        density={density}
        showReset={shouldShowAdvancedPanelHeaderReset(showResetOverride, onReset, modifiedCount)}
        onReset={onReset}
        disabled={disabled}
      />
      <div className={filterAdvancedPanelInnerVariants({ density })}>
        <FilterAdvancedPanelFields
          schema={schema}
          state={state}
          onValueChange={onValueChange}
          children={children}
          disabled={disabled}
          idPrefix={idPrefix}
        />
      </div>

      {onClearAll && schema && state && shouldShowAdvancedPanelClearAll(schema, state) ? (
        <div className={filterAdvancedPanelFooterVariants({ density })}>
          <Button type="button" variant="ghost" size="sm" disabled={disabled} onClick={onClearAll}>
            {clearAllLabel}
          </Button>
        </div>
      ) : null}
    </div>
  )
}

export function hasFilterAdvancedPanelContent<TData, TState extends Record<string, unknown>>({
  schema,
  state,
  children,
}: {
  schema?: FilterSchema<TData, TState>
  state?: TState
  children?: ReactNode
}): boolean {
  if (children != null) return true
  if (!schema || !state) return false
  return resolveVisibleAdvancedFields(schema, state).length > 0
}
