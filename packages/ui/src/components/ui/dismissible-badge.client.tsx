'use client'

import { X } from 'lucide-react'

import { cn } from '../../lib/utils'
import { Badge, type BadgeProps } from './badge'
import { badgeDismissButtonVariants, dismissibleBadgeVariants } from './badge.variants'

export interface DismissibleBadgeProps extends Pick<BadgeProps, 'variant' | 'className'> {
  label: string
  onDismiss: () => void
  disabled?: boolean
  className?: string
  /** Overrides the default `Remove {label}` aria-label on the dismiss control. */
  dismissLabel?: string
}

/** Badge with a focusable dismiss control — for selected tags, filter chips, etc. */
export function DismissibleBadge({
  label,
  onDismiss,
  disabled,
  className,
  dismissLabel,
  variant = 'secondary',
}: DismissibleBadgeProps) {
  return (
    <Badge variant={variant} className={cn(dismissibleBadgeVariants(), className)}>
      <span>{label}</span>
      <button
        type="button"
        className={badgeDismissButtonVariants()}
        aria-label={dismissLabel ?? `Remove ${label}`}
        disabled={disabled}
        onClick={(event) => {
          event.stopPropagation()
          onDismiss()
        }}
      >
        <X className="size-3" aria-hidden />
      </button>
    </Badge>
  )
}
