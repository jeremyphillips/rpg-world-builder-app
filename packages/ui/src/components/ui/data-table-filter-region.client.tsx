'use client'

import { ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react'
import { useId, type ElementType, type ReactNode } from 'react'

import { Badge } from './badge'
import { Button } from './button.client'
import { resolveFieldActionBandClassName } from './field-row-presentation.lib'
import { cn } from '../../lib/utils'
import { FilterAdvancedPanel } from '../../filters/filter-advanced-panel.client'
import { useOptionalFilterChrome } from '../../filters/filter-chrome.context'
import { resolveFilterControlSize } from '../../filters/filter-presentation.lib'
import {
  dataTableFilterRegionLabelSpacerVariants,
  dataTableFilterRegionPanelRowVariants,
  dataTableFilterRegionPrimaryInnerVariants,
  dataTableFilterRegionPrimaryVariants,
  dataTableFilterRegionRailStackVariants,
  dataTableFilterRegionTriggerVariants,
  dataTableFilterRegionTriggerWrapVariants,
  dataTableFilterRegionVariants,
} from './data-table-filter-region.variants'

export type DataTableFilterRegionLabels = {
  moreFilters?: string
  additionalFilters?: string
  reset?: string
  collapse?: string
}

const DEFAULT_LABELS: Required<DataTableFilterRegionLabels> = {
  moreFilters: 'More filters',
  additionalFilters: 'Additional filters',
  reset: 'Reset',
  collapse: 'Collapse',
}

export type DataTableFilterRegionProps = {
  primaryFilters: ReactNode
  /** Field content only — the region renders the panel wrapper around it. */
  additionalFilterFields?: ReactNode
  additionalFiltersOpen: boolean
  onAdditionalFiltersOpenChange: (open: boolean) => void
  activeAdditionalFilterCount?: number
  onResetAdditionalFilters?: () => void
  panelHeadingElement?: ElementType
  labels?: DataTableFilterRegionLabels
  className?: string
  disabled?: boolean
}

function buildTriggerAccessibleLabel(
  open: boolean,
  moreFiltersLabel: string,
  activeCount: number,
): string {
  const action = open ? 'Hide' : 'Show'
  if (activeCount > 0) {
    return `${action} ${moreFiltersLabel.toLowerCase()}, ${activeCount} active`
  }
  return `${action} ${moreFiltersLabel.toLowerCase()}`
}

export function DataTableFilterRegion({
  primaryFilters,
  additionalFilterFields,
  additionalFiltersOpen,
  onAdditionalFiltersOpenChange,
  activeAdditionalFilterCount = 0,
  onResetAdditionalFilters,
  panelHeadingElement,
  labels: labelsProp,
  className,
  disabled = false,
}: DataTableFilterRegionProps) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp }
  const panelId = useId()
  const chrome = useOptionalFilterChrome()
  const density = chrome?.density ?? 'compact'
  const triggerBandClassName = resolveFieldActionBandClassName(resolveFilterControlSize(density))

  const hasAdditionalFilters = additionalFilterFields != null

  return (
    <div className={cn(dataTableFilterRegionVariants(), className)}>
      <div className={dataTableFilterRegionPrimaryVariants()}>
        <div
          className={dataTableFilterRegionPrimaryInnerVariants({
            hasTrigger: hasAdditionalFilters,
          })}
        >
          {primaryFilters}
          {hasAdditionalFilters ? (
            <div className={dataTableFilterRegionTriggerWrapVariants()}>
              <div className={dataTableFilterRegionRailStackVariants({ density })}>
                <span aria-hidden className={dataTableFilterRegionLabelSpacerVariants({ density })}>
                  &nbsp;
                </span>
                <div className={triggerBandClassName}>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={disabled}
                    aria-expanded={additionalFiltersOpen}
                    aria-controls={panelId}
                    aria-label={buildTriggerAccessibleLabel(
                      additionalFiltersOpen,
                      labels.moreFilters,
                      activeAdditionalFilterCount,
                    )}
                    className={dataTableFilterRegionTriggerVariants()}
                    onClick={() => onAdditionalFiltersOpenChange(!additionalFiltersOpen)}
                  >
                    <SlidersHorizontal className="size-3.5" aria-hidden />
                    {labels.moreFilters}
                    {activeAdditionalFilterCount > 0 ? (
                      <Badge appearance="soft" tone="neutral" size="sm" className="ml-0.5">
                        {activeAdditionalFilterCount}
                      </Badge>
                    ) : null}
                    {additionalFiltersOpen ? (
                      <ChevronUp className="size-3.5 opacity-60" aria-hidden />
                    ) : (
                      <ChevronDown className="size-3.5 opacity-60" aria-hidden />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {hasAdditionalFilters ? (
        <div className={dataTableFilterRegionPanelRowVariants()}>
          <FilterAdvancedPanel
            open={additionalFiltersOpen}
            headerVariant="eyebrow"
            heading={labels.additionalFilters}
            headingElement={panelHeadingElement}
            resetLabel={labels.reset}
            collapseLabel={labels.collapse}
            onReset={onResetAdditionalFilters}
            onCollapse={() => onAdditionalFiltersOpenChange(false)}
            showReset={activeAdditionalFilterCount > 0}
            id={panelId}
            disabled={disabled}
          >
            {additionalFilterFields}
          </FilterAdvancedPanel>
        </div>
      ) : null}
    </div>
  )
}
