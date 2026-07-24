'use client'

import type { ReactNode } from 'react'

import { cn } from '../lib/utils'
import type { FilterFieldPresentation } from './filter-presentation.lib'
import type { FilterFieldWidth } from './filter-schema.types'

export type FilterSelectFieldLayout = 'inline' | 'stacked' | 'default'

type FilterSelectFieldChromeProps = {
  layout: FilterSelectFieldLayout
  presentation: Extract<FilterFieldPresentation, { type: 'select' }>
  controlId: string
  label: string
  ariaLabel?: string
  widthClassName?: string
  children: ReactNode
}

export function FilterSelectFieldChrome({
  layout,
  presentation,
  controlId,
  label,
  ariaLabel,
  widthClassName,
  children,
}: FilterSelectFieldChromeProps) {
  const groupLabel = ariaLabel ?? label

  if (layout === 'inline') {
    return (
      <div className={presentation.groupClassName} role="group" aria-label={groupLabel}>
        <span className={presentation.labelClassName}>{label}</span>
        <div className={cn('min-w-0', widthClassName)}>{children}</div>
      </div>
    )
  }

  if (layout === 'stacked') {
    return (
      <div className={presentation.groupClassName} role="group" aria-label={groupLabel}>
        <label htmlFor={controlId} className={presentation.labelClassName}>
          {label}
        </label>
        <div className={cn('min-w-0', widthClassName)}>{children}</div>
      </div>
    )
  }

  return <div className={presentation.groupClassName}>{children}</div>
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
