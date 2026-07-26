'use client'

import type { ElementType } from 'react'

import { Button } from '../components/ui/button.client'
import { filterAdvancedPanelHeaderVariants } from './filter-bar.variants'
import type { FilterDensity } from './filter-schema.types'

export type FilterAdvancedPanelHeaderProps = {
  headerVariant?: 'eyebrow' | 'none'
  heading?: string
  headingElement?: ElementType
  description?: string
  resetLabel?: string
  collapseLabel?: string
  onReset?: () => void
  onCollapse?: () => void
  id?: string
  /** When set, overrides schema-derived modified-count for reset visibility. */
  showReset?: boolean
}

type FilterAdvancedPanelHeaderComponentProps = FilterAdvancedPanelHeaderProps & {
  density: FilterDensity
  showReset: boolean
  disabled?: boolean
}

export function FilterAdvancedPanelHeader({
  headerVariant = 'none',
  heading,
  headingElement: HeadingElement = 'h2',
  description,
  resetLabel = 'Reset',
  collapseLabel = 'Collapse',
  onReset,
  onCollapse,
  id,
  density,
  showReset,
  disabled,
}: FilterAdvancedPanelHeaderComponentProps) {
  if (headerVariant === 'none') return null

  const buttonDensity = density === 'compact' ? 'compact' : 'default'

  return (
    <div className={filterAdvancedPanelHeaderVariants({ density })}>
      <div className="min-w-0 flex-1">
        {heading ? (
          <HeadingElement
            id={id}
            className="text-eyebrow-sm font-semibold uppercase tracking-eyebrow text-muted-foreground"
          >
            {heading}
          </HeadingElement>
        ) : null}
        {description ? <p className="mt-1 text-xs text-muted-foreground">{description}</p> : null}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {showReset && onReset ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            density={buttonDensity}
            disabled={disabled}
            onClick={onReset}
            aria-label="Reset additional filters"
          >
            {resetLabel}
          </Button>
        ) : null}
        {onCollapse ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            density={buttonDensity}
            disabled={disabled}
            onClick={onCollapse}
          >
            {collapseLabel}
          </Button>
        ) : null}
      </div>
    </div>
  )
}
