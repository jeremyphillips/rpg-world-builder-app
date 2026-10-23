'use client'

import { ChevronDown, ChevronRight } from 'lucide-react'
import { useId, type ReactNode } from 'react'

import { Badge } from './badge'
import { iconGlyphRootClasses } from './icon-glyph.variants'
import { interactiveFocusVariants } from './interactive-focus.variants'
import { cn } from '../../lib/utils'
import { borderStrength } from './border-strength'
import { filterBarVariants } from '../../filters/filter-bar.variants'

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
    <div className={cn('ui-data-table__filter-region', borderStrength(), className)}>
      <div className={cn('min-w-0', hasAdditionalFilters && 'border-b border-border pb-3')}>
        {primaryFilters}
      </div>

      {hasAdditionalFilters ? (
        <div className="flex min-w-0">
          <button
            type="button"
            disabled={disabled}
            aria-expanded={additionalFiltersOpen}
            aria-controls={additionalFiltersOpen ? panelId : undefined}
            className={cn(
              'inline-flex w-fit items-center gap-1.5 rounded-md text-style-label text-foreground',
              'hover:text-foreground/80',
              'disabled:pointer-events-none disabled:opacity-50',
              interactiveFocusVariants({ context: 'embedded' }),
            )}
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
        <div id={panelId} className={filterBarVariants()}>
          {additionalFilterFields}
        </div>
      ) : null}
    </div>
  )
}
