'use client'

import type { ReactElement, ReactNode } from 'react'
import { cn } from '../lib/utils'
import { FilterFieldCaption } from './filter-field-caption.client'
import { FilterFloatingField } from './filter-floating-field.client'
import type { FilterFieldPresentation } from './filter-presentation.lib'
import type { FilterSelectPresentation } from './filter-chrome.context'
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
      <div data-field-align="" className={presentation.groupClassName}>
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
 * Resolves select chrome layout.
 * Explicit `field.layout` wins, then the region `selectPresentation`, then stacked.
 * `width` never forces a layout — stacked keeps visible label association regardless of width token.
 */
export function resolveFilterSelectFieldLayout(
  field: {
    layout?: 'stacked' | 'inline' | 'floating'
    width?: FilterFieldWidth
  },
  options?: { selectPresentation?: FilterSelectPresentation },
): FilterSelectFieldLayout {
  void field.width
  if (field.layout === 'floating' || field.layout === 'inline' || field.layout === 'stacked') {
    return field.layout
  }
  if (options?.selectPresentation === 'floating') return 'floating'
  return 'stacked'
}
