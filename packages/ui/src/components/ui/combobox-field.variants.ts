import { cn } from '../../lib/utils'
import {
  interactiveListPanelVariants,
  interactiveListPopoverHostClasses,
} from './interactive-list.variants'
import { fieldSizeTypographyClasses, type FieldSizeToken } from './field-sizing.variants'
import type { FieldSize } from './field.client'
/** Trigger placeholder / selected value type scale — matches single-line field controls. */
export function comboboxTriggerValueTextClasses(size: FieldSize = 'md'): string {
  return cn('min-w-0 truncate', fieldSizeTypographyClasses[size])
}

/** Negative `sideOffset` magnitude — matches field-control height so the panel overlaps the trigger. */
export const COMBOBOX_TRIGGER_OVERLAP_OFFSET = {
  xs: 24,
  sm: 32,
  md: 36,
  lg: 44,
} as const satisfies Record<FieldSizeToken, number>

/** Popover panel wrapping the search field and scrollable option list. */
export const comboboxContentVariants = (options?: { triggerWidth?: 'match' | 'fit' }) =>
  cn(
    interactiveListPanelVariants({ triggerWidth: options?.triggerWidth ?? 'match' }),
    interactiveListPopoverHostClasses,
  )

/** Dismissible-badge row shown below the trigger in multi-select mode. */
export const comboboxSelectedItemsRowVariants = 'flex flex-wrap gap-1.5 pt-2'

/** Vertical list for custom selected-item renderers in multi-select mode. */
export const comboboxSelectedListVariants = 'flex flex-col gap-2 pt-2'

/** Hides the trigger while open; panel overlaps the same slot via negative sideOffset. */
export const comboboxTriggerOpenVariants = 'pointer-events-none invisible'
