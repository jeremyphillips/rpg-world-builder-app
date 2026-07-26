'use client'

import type { ReactNode } from 'react'

import { Collapsible, CollapsibleContent } from '../components/ui/collapsible.client'
import { FILTER_DENSITY_DEFAULT } from './filter-bar.variants'
import {
  FilterAdvancedPanelBody,
  hasFilterAdvancedPanelContent,
} from './filter-advanced-panel-body.client'
import type { FilterAdvancedPanelHeaderProps } from './filter-advanced-panel-header.client'
import { FilterChromeProvider, useOptionalFilterChrome } from './filter-chrome.context'
import type { FilterDensity, FilterFieldId, FilterSchema } from './filter-schema.types'

export type { FilterAdvancedPanelHeaderProps } from './filter-advanced-panel-header.client'

export type FilterAdvancedPanelProps<
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
  children,
  open,
  className,
  density,
  ...bodyProps
}: FilterAdvancedPanelProps<TData, TState>) {
  const parentChrome = useOptionalFilterChrome()
  const resolvedDensity = density ?? parentChrome?.density ?? FILTER_DENSITY_DEFAULT

  if (!hasFilterAdvancedPanelContent({ schema, state, children })) {
    return null
  }

  const panelContent = (
    <FilterAdvancedPanelBody
      {...bodyProps}
      schema={schema}
      state={state}
      children={children}
      density={resolvedDensity}
    />
  )

  return (
    <Collapsible open={open} className={className}>
      <CollapsibleContent>
        {parentChrome ? (
          panelContent
        ) : (
          <FilterChromeProvider density={resolvedDensity}>{panelContent}</FilterChromeProvider>
        )}
      </CollapsibleContent>
    </Collapsible>
  )
}
