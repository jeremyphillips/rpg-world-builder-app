'use client'
import { Icon } from './icon/icon'

import { cn } from '../../lib/utils'
import type { FieldSize } from './field.client'
import {
  fieldClearAffordanceGroupedClasses,
  fieldClearAffordanceInsetVariants,
} from './field-clear-affordance.variants'

export type FieldClearAffordanceButtonProps = {
  size: FieldSize
  accessibleName: string
  onClear: () => void
  /** `grouped` — select/combobox trigger segment; `inset` — SearchBar trailing slot. */
  variant?: 'grouped' | 'inset'
  className?: string
}

/** Inline × clear — grouped trigger segment or SearchBar inset slot. */
export function FieldClearAffordanceButton({
  size,
  accessibleName,
  onClear,
  variant = 'grouped',
  className,
}: FieldClearAffordanceButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        variant === 'grouped'
          ? fieldClearAffordanceGroupedClasses(size)
          : fieldClearAffordanceInsetVariants({ size }),
        className,
      )}
      aria-label={accessibleName}
      onClick={onClear}
    >
      <Icon name="x" size="md" />
    </button>
  )
}
