'use client'

import { CircleSlash } from 'lucide-react'

import { cn } from '../../lib/utils'
import {
  fieldGroupSummaryStatusIndicatorVariants,
  fieldGroupSummaryStatusLabelVariants,
} from './field-group-summary-disclosure-collapsed.variants'

export type InlineInactiveStatusProps = {
  label: string
  className?: string
}

/** Circle-slash inactive status inline with primary labels — matches overview table metadata. */
export function InlineInactiveStatus({ label, className }: InlineInactiveStatusProps) {
  return (
    <span className={cn('inline-flex shrink-0 items-center gap-1 text-xs', className)}>
      <CircleSlash
        aria-hidden
        className={fieldGroupSummaryStatusIndicatorVariants({
          indicator: 'inactive',
          tone: 'warning',
        })}
      />
      <span className={cn(fieldGroupSummaryStatusLabelVariants({ tone: 'warning' }), 'text-xs')}>
        {label}
      </span>
    </span>
  )
}
