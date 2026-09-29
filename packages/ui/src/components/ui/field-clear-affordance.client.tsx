'use client'

import { X } from 'lucide-react'

import { cn } from '../../lib/utils'
import type { FieldSize } from './field.client'
import {
  groupedEndLabelSegmentShellClasses,
  selectCaretSlotWidthClasses,
} from './select-compact-trigger.variants'

export type FieldClearAffordanceButtonProps = {
  size: FieldSize
  accessibleName: string
  onClear: () => void
}

/** Inline × clear control paired with a grouped select or combobox trigger. */
export function FieldClearAffordanceButton({
  size,
  accessibleName,
  onClear,
}: FieldClearAffordanceButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        groupedEndLabelSegmentShellClasses(size),
        selectCaretSlotWidthClasses[size],
        'inline-flex shrink-0 items-center justify-center text-muted-foreground hover:text-foreground',
      )}
      aria-label={accessibleName}
      onClick={onClear}
    >
      <X className="size-icon-glyph-md" aria-hidden />
    </button>
  )
}
