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
      <div
        data-field-align=""
        className={cn(presentation.controlBandClassName, presentation.groupClassName)}
        role="group"
        aria-label={groupLabel}
      >
        <span className={presentation.labelClassName}>{label}</span>
        <div className={cn('min-w-0', widthClassName)}>{children}</div>
      </div>
    )
  }

  if (layout === 'stacked') {
    return (
      <div
        data-field-align=""
        className={presentation.groupClassName}
        role="group"
        aria-label={groupLabel}
      >
        {/* Stacked selects always wire label ↔ control, including when `width` is set. */}
        <label htmlFor={controlId} className={presentation.labelClassName}>
          {label}
        </label>
        <div className={cn(presentation.controlBandClassName, 'min-w-0', widthClassName)}>
          {children}
        </div>
      </div>
    )
  }

  return (
    <div
      data-field-align=""
      className={cn(presentation.controlBandClassName, presentation.groupClassName)}
    >
      {children}
    </div>
  )
}

/**
 * Resolves select chrome layout. `width` never forces a layout — stacked keeps
 * visible label association regardless of width token.
 */
export function resolveFilterSelectFieldLayout(field: {
  layout?: 'stacked' | 'inline'
  width?: FilterFieldWidth
}): FilterSelectFieldLayout {
  // `width` is accepted for call-site clarity but must not change layout/a11y.
  void field.width
  const layout = field.layout ?? 'stacked'
  if (layout === 'inline') return 'inline'
  if (layout === 'stacked') return 'stacked'
  return 'default'
}
