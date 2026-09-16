'use client'

import { AlertTriangle } from 'lucide-react'

import { cn } from '../../lib/utils'
import { Badge } from './badge'

export interface ValidationIssueCountBadgeProps {
  count: number
  className?: string
}

/** Compact destructive count badge with warning icon for global validation affordances. */
export function ValidationIssueCountBadge({ count, className }: ValidationIssueCountBadgeProps) {
  if (count <= 0) return null

  return (
    <Badge
      appearance="soft"
      tone="destructive"
      size="sm"
      layout="counter"
      aria-hidden
      leadingIcon={<AlertTriangle aria-hidden />}
      className={cn('gap-1', className)}
    >
      {count}
    </Badge>
  )
}
