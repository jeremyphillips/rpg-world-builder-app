import * as React from 'react'

import { cn } from '../../lib/utils'
import { statusDotVariants, type StatusDotVariantProps } from './status-dot.variants'

export interface StatusDotProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'>, StatusDotVariantProps {
  /** When set, the dot is exposed to assistive tech instead of being decorative. */
  label?: string
}

export function StatusDot({ className, tone, size, label, ...props }: StatusDotProps) {
  if (label) {
    return (
      <span className="inline-flex items-center gap-1.5">
        <span className={cn(statusDotVariants({ tone, size, className }))} aria-hidden {...props} />
        <span className="text-xs text-muted-foreground">{label}</span>
      </span>
    )
  }

  return (
    <span aria-hidden className={cn(statusDotVariants({ tone, size, className }))} {...props} />
  )
}
