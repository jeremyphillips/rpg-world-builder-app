'use client'

import type { ReactElement, ReactNode } from 'react'
import { cn } from '../lib/utils'
import { FilterFieldCaption } from './filter-field-caption.client'
import { FilterFloatingField } from './filter-floating-field.client'
import type { FilterFieldPresentation } from './filter-presentation.lib'
import type { FilterFieldWidth } from './filter-schema.types'

export type FilterSelectFieldLayout = 'inline' | 'stacked' | 'default' | 'floating'

type FilterSelectFieldChromeProps = {
  layout: FilterSelectFieldLayout
  presentation: Extract<FilterFieldPresentation, { type: 'select' }>
  controlId: string
  label: string
  ariaLabel?: string
  /** Canonical populated state for `layout: 'floating'`. */
  populated?: boolean
  disabled?: boolean
  widthClassName?: string
  children: ReactNode
}

export function FilterSelectFieldChrome({
  layout,
  presentation,
  controlId,
  label,
  ariaLabel,
  populated = true,
  disabled,
  widthClassName,
  children,
}: FilterSelectFieldChromeProps) {
  const groupLabel = ariaLabel ?? label

  if (layout === 'floating') {
    return (
      <div data-field-align="" className={cn(presentation.groupClassName, 'w-fit shrink-0')}>
        <FilterFloatingField
          id={controlId}
          label={label}
          populated={populated}
          disabled={disabled}
          width="auto"
        >
          {children as ReactElement}
        </FilterFloatingField>
      </div>
    )
  }

  if (layout === 'inline') {
    return (
      <div
        data-field-align=""
        className={cn(
          presentation.controlBandClassName,
          presentation.groupClassName,
          'w-fit shrink-0',
        )}
        role="group"
        aria-label={groupLabel}
      >
        <FilterFieldCaption>{label}</FilterFieldCaption>
        <div className={cn(widthClassName)}>{children}</div>
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
        <FilterFieldCaption as="label" htmlFor={controlId}>
          {label}
        </FilterFieldCaption>
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
  layout?: 'stacked' | 'inline' | 'floating'
  width?: FilterFieldWidth
}): FilterSelectFieldLayout {
  // `width` is accepted for call-site clarity but must not change layout/a11y.
  void field.width
  if (field.layout === 'floating') return 'floating'
  const layout = field.layout ?? 'stacked'
  if (layout === 'inline') return 'inline'
  if (layout === 'stacked') return 'stacked'
  return 'default'
}
