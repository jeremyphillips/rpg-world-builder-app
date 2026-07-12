'use client'

import { Chip, type ChipRemovableProps } from './chip.client'

export interface DismissibleBadgeProps {
  label: string
  onDismiss: () => void
  disabled?: boolean
  size?: ChipRemovableProps['size']
  dismissLabel?: string
  className?: string
}

/** Combobox selected-value chip — delegates to `Chip mode="removable"`. */
export function DismissibleBadge({
  label,
  onDismiss,
  disabled,
  dismissLabel,
  size = 'md',
  className,
}: DismissibleBadgeProps) {
  return (
    <Chip
      mode="removable"
      size={size}
      onRemove={onDismiss}
      removeLabel={dismissLabel ?? `Remove ${label}`}
      disabled={disabled}
      className={className}
    >
      {label}
    </Chip>
  )
}
