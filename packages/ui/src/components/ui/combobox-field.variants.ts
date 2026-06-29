import { cva } from 'class-variance-authority'

import type { FieldSizeToken } from './field-sizing.variants'

/** Negative `sideOffset` magnitude — matches field-control height so the panel overlaps the trigger. */
export const COMBOBOX_TRIGGER_OVERLAP_OFFSET = {
  sm: 32,
  md: 36,
  lg: 44,
} as const satisfies Record<FieldSizeToken, number>

/** Popover panel wrapping the search field and scrollable option list. */
export const comboboxContentVariants = cva(
  'z-50 w-[var(--radix-popover-trigger-width)] overflow-hidden rounded-md border border-border bg-popover p-0 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
)

/**
 * Search row pinned to the top of the combobox panel — matches trigger field-control
 * height/background so the open panel reads as one expanded input.
 */
export const comboboxSearchRowVariants = cva(
  'flex items-center gap-2 border-b border-border bg-transparent px-3 dark:bg-input/30',
  {
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
  },
)

/** Inner search control — no standalone field chrome; the search row owns the input look. */
export const comboboxSearchInputVariants = cva(
  'min-w-0 flex-1 border-0 bg-transparent shadow-none rounded-none dark:bg-transparent focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
)

/** Scrollable listbox region. */
export const comboboxListVariants = cva('max-h-60 overflow-y-auto p-1')

/** Individual selectable option row. */
export const comboboxOptionVariants = cva(
  'relative flex w-full cursor-default select-none items-start gap-2 rounded-sm px-2 py-1.5 text-left text-sm outline-none focus-visible:bg-accent focus-visible:text-accent-foreground data-[active=true]:bg-accent data-[active=true]:text-accent-foreground data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50',
)

/** Empty-state message when the filter matches nothing. */
export const comboboxEmptyVariants = cva('px-2 py-4 text-center text-sm text-muted-foreground')

/** Dismissible-badge row shown below the trigger in multi-select mode. */
export const comboboxSelectedItemsRowVariants = cva('flex flex-wrap gap-1.5 pt-2')

/** @deprecated Use {@link comboboxSelectedItemsRowVariants}. */
export const comboboxChipRowVariants = comboboxSelectedItemsRowVariants

/** Vertical list for custom selected-item renderers in multi-select mode. */
export const comboboxSelectedListVariants = cva('flex flex-col gap-2 pt-2')

/** Hides the trigger while open; panel overlaps the same slot via negative sideOffset. */
export const comboboxTriggerOpenVariants = cva('pointer-events-none invisible')
