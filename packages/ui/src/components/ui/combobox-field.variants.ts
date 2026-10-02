import { cva } from 'class-variance-authority'

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

/**
 * Search row pinned to the top of the combobox panel — matches trigger field-control
 * height/background so the open panel reads as one expanded input.
 */
export const comboboxSearchRowVariants = cva('flex w-full items-center gap-2 px-3', {
  variants: {
    size: {
      sm: 'h-8 text-xs',
      md: 'h-9 text-md',
      lg: 'h-11 text-base',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

/** Inner search control — no standalone field chrome; the search row owns the input look. */
export const comboboxSearchInputVariants = cva(
  'min-w-0 flex-1 border-0 bg-transparent shadow-none rounded-none dark:bg-transparent focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
)

/** Dismissible-badge row shown below the trigger in multi-select mode. */
export const comboboxSelectedItemsRowVariants = cva('flex flex-wrap gap-1.5 pt-2')

/** @deprecated Use {@link comboboxSelectedItemsRowVariants}. */
export const comboboxChipRowVariants = comboboxSelectedItemsRowVariants

/** Vertical list for custom selected-item renderers in multi-select mode. */
export const comboboxSelectedListVariants = cva('flex flex-col gap-2 pt-2')

/** Hides the trigger while open; panel overlaps the same slot via negative sideOffset. */
export const comboboxTriggerOpenVariants = cva('pointer-events-none invisible')
