import * as React from 'react'
import type { HTMLAttributes } from 'react'

import { cn } from '../../lib/utils'
import type { FieldRowAlignment } from './field-control-band.variants'
import { resolveFieldRowClasses } from './field-row-presentation.lib'

export interface FieldRowProps extends HTMLAttributes<HTMLDivElement> {
  /** Default `control-edge`. Use `start` when a sibling reserves derived metadata below the control. */
  align?: FieldRowAlignment
  /** Inter-control gap — default `form` (`gap-6`). Schema rows may use `compact` (`gap-4`). */
  gap?: 'toolbar' | 'form' | 'compact'
  /**
   * `flow` — flex wrap (`items-end` by default) for filters, toolbars, and legacy rows.
   * `anatomy-grid` — three-region subgrid columns for schema `kind: 'row'` sections.
   */
  layout?: 'flow' | 'anatomy-grid'
}

/**
 * Lays fields out side by side. Fields keep their `width`: fixed tokens
 * (`xs`–`xl`/`auto`) stay their intrinsic size, while `full`/fractional fields
 * share the remaining space (equal split by default). Wraps on narrow widths.
 *
 * Schema rows use `layout="anatomy-grid"` with classes/styles from
 * {@link resolveFieldRowAnatomyPresentation}. Non-schema uses flex
 * (`items-end` / control-edge) unless `align="start"`.
 */
export const FieldRow = React.forwardRef<HTMLDivElement, FieldRowProps>(function FieldRow(
  { className, align = 'control-edge', gap = 'form', layout = 'flow', ...props },
  ref,
) {
  const isAnatomyGrid = layout === 'anatomy-grid'

  return (
    <div
      ref={ref}
      data-field-row=""
      data-field-row-anatomy={isAnatomyGrid ? '' : undefined}
      className={cn(
        isAnatomyGrid ? undefined : resolveFieldRowClasses({ layout: 'flow', align, gap }),
        className,
      )}
      {...props}
    />
  )
})
