'use client'

import { ChevronDown, ChevronRight } from 'lucide-react'
import { useId, type ReactNode } from 'react'

import { Badge } from './badge'
import { iconGlyphRootClasses } from './icon-glyph.variants'
import { cn } from '../../lib/utils'
import {
  dataTableFilterRegionAdditionalRowVariants,
  dataTableFilterRegionDisclosureRowVariants,
  dataTableFilterRegionDisclosureVariants,
  dataTableFilterRegionPrimaryRowVariants,
  dataTableFilterRegionVariants,
} from './data-table-filter-region.variants'

export type DataTableFilterRegionLabels = {
  additionalFilters?: string
}

const DEFAULT_LABELS: Required<DataTableFilterRegionLabels> = {
  additionalFilters: 'Additional filters',
}

export type DataTableFilterRegionProps = {
  primaryFilters: ReactNode
  /** Field content only — the region renders it in the same panel when open. */
  additionalFilterFields?: ReactNode
  additionalFiltersOpen: boolean
  onAdditionalFiltersOpenChange: (open: boolean) => void
  activeAdditionalFilterCount?: number
  labels?: DataTableFilterRegionLabels
  className?: string
  disabled?: boolean
}

function additionalFiltersBadgeLabel(activeCount: number): string {
  return `${activeCount} active`
}

export function DataTableFilterRegion({
  primaryFilters,
  additionalFilterFields,
  additionalFiltersOpen,
  onAdditionalFiltersOpenChange,
  activeAdditionalFilterCount = 0,
  labels: labelsProp,
  className,
  disabled = false,
}: DataTableFilterRegionProps) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp }
  const panelId = useId()
  const hasAdditionalFilters = additionalFilterFields != null
  const showActiveBadge = activeAdditionalFilterCount > 0

  return (
    <div className={cn(dataTableFilterRegionVariants(), className)}>
      <div className={dataTableFilterRegionPrimaryRowVariants({ divided: hasAdditionalFilters })}>
        {primaryFilters}
      </div>

      {hasAdditionalFilters ? (
        <div className={dataTableFilterRegionDisclosureRowVariants()}>
          <button
            type="button"
            disabled={disabled}
            aria-expanded={additionalFiltersOpen}
            aria-controls={additionalFiltersOpen ? panelId : undefined}
            className={dataTableFilterRegionDisclosureVariants()}
            onClick={() => onAdditionalFiltersOpenChange(!additionalFiltersOpen)}
          >
            {additionalFiltersOpen ? (
              <ChevronDown className={iconGlyphRootClasses.sm} aria-hidden />
            ) : (
              <ChevronRight className={iconGlyphRootClasses.sm} aria-hidden />
            )}
            {labels.additionalFilters}
            {showActiveBadge ? (
              <Badge appearance="soft" tone="neutral" size="sm">
                {additionalFiltersBadgeLabel(activeAdditionalFilterCount)}
              </Badge>
            ) : null}
          </button>
        </div>
      ) : null}

      {hasAdditionalFilters && additionalFiltersOpen ? (
        <div id={panelId} className={dataTableFilterRegionAdditionalRowVariants()}>
          {additionalFilterFields}
        </div>
      ) : null}
    </div>
  )
}
