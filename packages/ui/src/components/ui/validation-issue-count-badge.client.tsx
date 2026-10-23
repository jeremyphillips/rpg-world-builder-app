'use client'
import { Icon } from './icon/icon'

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
      leadingIcon={<Icon name="triangle-alert" size="2xl" />}
      className={className}
    >
      {count}
    </Badge>
  )
}
