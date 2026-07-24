'use client'

import type { ReactNode } from 'react'

import { fieldWidthVariants } from '../components/ui/field-control.variants'
import { cn } from '../lib/utils'
import {
  filterBarControlVariants,
  filterFieldLabelVariants,
  filterInlineFieldGroupVariants,
  filterStackedFieldGroupVariants,
} from './filter-bar.variants'
import type { FilterDensity, FilterFieldWidth } from './filter-schema.types'

export type FilterSelectFieldLayout = 'inline' | 'stacked' | 'default'

type FilterSelectFieldChromeProps = {
  layout: FilterSelectFieldLayout
  density: FilterDensity
  controlId: string
  label: string
  ariaLabel?: string
  width?: FilterFieldWidth
  children: ReactNode
}

export function FilterSelectFieldChrome({
  layout,
  density,
  controlId,
  label,
  ariaLabel,
  width = 'md',
  children,
}: FilterSelectFieldChromeProps) {
  const groupLabel = ariaLabel ?? label

  if (layout === 'inline') {
    return (
      <div
        className={filterInlineFieldGroupVariants({ density })}
        role="group"
        aria-label={groupLabel}
      >
        <span className={filterFieldLabelVariants({ density })}>{label}</span>
        <div className={cn('min-w-0', fieldWidthVariants({ width }))}>{children}</div>
      </div>
    )
  }

  if (layout === 'stacked') {
    return (
      <div
        className={filterStackedFieldGroupVariants({ density })}
        role="group"
        aria-label={groupLabel}
      >
        <label htmlFor={controlId} className={filterFieldLabelVariants({ density })}>
          {label}
        </label>
        <div className={cn('min-w-0', fieldWidthVariants({ width }))}>{children}</div>
      </div>
    )
  }

  return <div className={filterBarControlVariants({ type: 'select' })}>{children}</div>
}

export function resolveFilterSelectFieldLayout(field: {
  layout?: 'stacked' | 'inline'
  width?: FilterFieldWidth
}): FilterSelectFieldLayout {
  const layout = field.layout ?? 'stacked'
  if (layout === 'inline') return 'inline'
  if (layout === 'stacked' && field.width) return 'stacked'
  return 'default'
}
