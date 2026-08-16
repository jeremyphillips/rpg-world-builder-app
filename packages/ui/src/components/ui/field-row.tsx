import type { HTMLAttributes } from 'react'

import { cn } from '../../lib/utils'
import type { FieldRowAlignment } from './field-control-band.variants'
import { resolveFieldRowClasses } from './field-row-presentation.lib'

export interface FieldRowProps extends HTMLAttributes<HTMLDivElement> {
  /** Default `control-edge`. Use `start` when a sibling reserves derived metadata below the control. */
  align?: FieldRowAlignment
  /** Inter-control gap — default `form` (`gap-6`). Schema rows may use `compact` (`gap-4`). */
  gap?: 'toolbar' | 'form' | 'compact'
}

/**
 * Lays fields out side by side. Fields keep their `width`: fixed tokens
 * (`xs`–`xl`/`auto`) stay their intrinsic size, while `full`/fractional fields
 * share the remaining space (equal split by default). Wraps on narrow widths.
 *
 * Aligns sibling fields on the shared control band (`items-end` / control-edge)
 * unless `align="start"` — used when one field reserves derived metadata height.
 */
export function FieldRow({
  className,
  align = 'control-edge',
  gap = 'form',
  ...props
}: FieldRowProps) {
  return (
    <div
      data-field-row=""
      className={cn(resolveFieldRowClasses({ layout: 'flow', align, gap }), className)}
      {...props}
    />
  )
}
