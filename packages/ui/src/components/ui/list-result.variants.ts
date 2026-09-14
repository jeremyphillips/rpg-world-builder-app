import { cva } from 'class-variance-authority'

import { cn } from '../../lib/utils'

/** Slot-based toolbar — search and optional filter rows; hosts own control state. */
export const listResultToolbarVariants = cva('border-b border-border bg-input')

export const listResultToolbarSearchRowVariants = cva('flex items-center gap-2 px-3')

export const listResultToolbarFilterRowVariants = cva('border-t border-border px-3 py-2')

/** Visual-only group heading; hosts own section / listbox group semantics. */
export const listResultGroupHeadingVariants = cva(
  'border-b border-border-subtle bg-surface-faint px-3 py-1',
)

/** Bounded scrollport — toolbar stays fixed outside this region. */
export const listResultViewportVariants = cva('max-h-60 overflow-y-auto')

/** Non-scrolling list shell with edge-to-edge dividers. */
export const listResultListVariants = cva(
  'm-0 list-none divide-y divide-border-faint bg-surface-lift p-0',
)

/** Empty-state copy inside a list. */
export const listResultEmptyVariants = cva('px-3 py-4 text-center text-sm text-muted-foreground')

/** Outer row shell — highlight rail, selected fill, and split-row layout. */
export const listResultItemShellVariants = cva('relative flex w-full items-stretch', {
  variants: {
    highlighted: {
      true: cn(
        'bg-control-hover',
        'before:absolute before:inset-y-0 before:left-0 before:w-0.5 before:bg-accent before:content-[""]',
      ),
      false: '',
    },
    selected: {
      true: 'bg-surface-subtle',
      false: '',
    },
    disabled: {
      true: 'pointer-events-none opacity-50',
      false: '',
    },
    interactive: {
      true: 'hover:bg-row-hover',
      false: '',
    },
  },
  compoundVariants: [
    {
      highlighted: true,
      interactive: true,
      className: 'hover:bg-control-hover',
    },
    {
      selected: true,
      interactive: true,
      className: 'hover:bg-surface-subtle',
    },
  ],
  defaultVariants: {
    highlighted: false,
    selected: false,
    disabled: false,
    interactive: true,
  },
})

/** Main hit area — identity and decorative trailing chrome. */
export const listResultItemMainVariants = cva(
  'flex min-w-0 flex-1 items-start gap-2 px-3 py-2 text-left outline-none',
)

/** Trailing action column — sibling to the main hit area, never nested inside it. */
export const listResultItemTrailingActionVariants = cva(
  'flex shrink-0 items-center self-stretch border-l border-border-faint px-2',
)

export const listResultItemNameVariants = cva('truncate font-body-emphasis text-sm')

export const listResultItemClassificationVariants = cva('truncate text-sm text-muted-foreground')

export const listResultItemMetadataVariants = cva('truncate text-xs text-muted-foreground')
