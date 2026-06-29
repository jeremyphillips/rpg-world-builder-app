'use client'

import { X } from 'lucide-react'

import { cn } from '../../lib/utils'
import { Badge, type BadgeProps } from './badge'
import {
  badgeDismissButtonVariants,
  dismissibleBadgeVariants,
  type BadgeSize,
} from './badge.variants'

export interface DismissibleBadgeProps extends Pick<BadgeProps, 'variant' | 'className'> {
  label: string
  onDismiss: () => void
  disabled?: boolean
  /** Badge type scale — defaults to `md`. */
  size?: BadgeSize
  /** Overrides the default `Remove {label}` aria-label on the dismiss control. */
  dismissLabel?: string
}

/** Badge with a focusable dismiss control — for combobox selections, filter tags, etc. */
export function DismissibleBadge({
  label,
  onDismiss,
  disabled,
  className,
  dismissLabel,
  variant = 'secondary',
  size = 'md',
}: DismissibleBadgeProps) {
  return (
    <Badge
      variant={variant}
      size={size}
      className={cn(dismissibleBadgeVariants({ size }), className)}
    >
      <span>{label}</span>
      <button
        type="button"
        className={badgeDismissButtonVariants({ size })}
        aria-label={dismissLabel ?? `Remove ${label}`}
        disabled={disabled}
        onClick={(event) => {
          event.stopPropagation()
          onDismiss()
        }}
      >
        <X aria-hidden />
      </button>
    </Badge>
  )
}
