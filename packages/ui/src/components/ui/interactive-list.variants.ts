import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import {
  menuChoiceRowItemResetClasses,
  selectableRowHighlightFillClasses,
  selectableRowHighlightRailClasses,
  selectableRowMenuHighlightFillClasses,
  selectableRowMenuHighlightRailClasses,
  selectableRowPointerHoverClasses,
} from './interactive-row.variants'
import { establishSurfaceCurrent } from './surface-current.lib'

export type InteractiveListSize = 'sm' | 'md' | 'lg'

/** Slot-based toolbar — search and optional filter rows; hosts own control state. */
export const interactiveListToolbarVariants = cva('border-b border-border bg-input')

export const interactiveListToolbarSearchRowVariants = cva('flex items-center gap-2 px-3')

export const interactiveListToolbarFilterRowVariants = cva('border-t border-border px-3 py-2')

/** Visual-only group heading; hosts own section / listbox group semantics. */
export const interactiveListGroupHeadingVariants = cva(
  'border-b border-border-subtle bg-surface-faint px-3 py-1',
  {
    variants: {
      first: {
        true: 'pt-2',
        false: '',
      },
      follows: {
        none: '',
        complete: 'border-t border-border-subtle',
        truncated: '',
      },
    },
    defaultVariants: {
      first: false,
      follows: 'none',
    },
  },
)

/** Bounded scrollport — toolbar stays fixed outside this region. */
export const interactiveListViewportVariants = cva('max-h-60 overflow-y-auto')

/** List surface without row separators — menu/listbox hosts may wrap one or more row lists. */
export const interactiveListSurfaceClasses = 'm-0 list-none bg-surface-lift p-0'

/** Faint top border on every direct row after the first — SSOT for combobox, menu, and search. */
export const interactiveListRowSeparatorClasses = '[&>*+*]:border-t [&>*+*]:border-border-faint'

/** Row-list shell — wrap row adapters only (not labels/separators). */
export const interactiveListVariants = cva(
  cn(interactiveListSurfaceClasses, interactiveListRowSeparatorClasses),
)

/** Empty-state copy inside a list. */
export const interactiveListEmptyVariants = cva(
  'px-3 py-4 text-center text-sm text-muted-foreground',
)

/** Shared panel shell for combobox popovers and choice menus (animation composed per host). */
export const interactiveListPanelVariants = cva(
  cn(
    'z-50 overflow-hidden rounded-md border border-border bg-background p-0 text-foreground shadow-md outline-none',
    establishSurfaceCurrent('background'),
  ),
  {
    variants: {
      triggerWidth: {
        match: 'w-[var(--radix-popover-trigger-width)] min-w-[var(--radix-popover-trigger-width)]',
        fit: 'w-max min-w-[var(--popover-menu-min-width)]',
      },
    },
    defaultVariants: {
      triggerWidth: 'match',
    },
  },
)

/** Popover open/close animation — combobox and similar Popover hosts only. */
export const interactiveListPopoverHostClasses =
  'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2'

/** DropdownMenu content animation — choice menu hosts only. */
export const interactiveListMenuHostClasses =
  'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2'

/** Outer row shell — highlight rail, selected fill, and split-row layout. */
export const interactiveListRowChromeVariants = cva('relative flex w-full items-stretch', {
  variants: {
    host: {
      row: '',
      menuitem: cn(
        'cursor-pointer outline-none',
        selectableRowMenuHighlightFillClasses,
        selectableRowMenuHighlightRailClasses,
      ),
    },
    highlighted: {
      true: cn(selectableRowHighlightFillClasses, selectableRowHighlightRailClasses),
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
      true: selectableRowPointerHoverClasses,
      false: '',
    },
  },
  compoundVariants: [
    {
      host: 'row',
      highlighted: true,
      interactive: true,
      className: selectableRowPointerHoverClasses,
    },
    {
      host: 'row',
      selected: true,
      interactive: true,
      className: 'hover:bg-surface-subtle',
    },
    {
      host: 'menuitem',
      interactive: true,
      className: '',
    },
  ],
  defaultVariants: {
    host: 'row',
    highlighted: false,
    selected: false,
    disabled: false,
    interactive: true,
  },
})

/** Main hit area — identity and decorative trailing chrome. */
export const interactiveListRowMainVariants = cva(
  'flex min-w-0 flex-1 items-start text-left outline-none',
  {
    variants: {
      size: {
        sm: 'gap-1 px-2 py-2',
        md: 'gap-2 px-3 py-2',
        lg: 'gap-2 px-4 py-2',
      },
      interactive: {
        true: 'cursor-pointer',
        false: '',
      },
    },
    defaultVariants: {
      size: 'md',
      interactive: true,
    },
  },
)

/** Trailing action column — sibling to the main hit area, never nested inside it. */
export const interactiveListRowTrailingActionVariants = cva(
  'flex shrink-0 items-center self-stretch border-l border-border-faint px-2',
)

/**
 * Radix menuitem reset — clears default menuitem padding/focus chrome.
 * `interactiveListRowMainVariants` must be composed after this (same `className`) so list row padding wins over `p-0`.
 */
export const menuChoiceItemResetVariants = cva(
  cn(
    'h-auto w-full border-0 p-0 text-inherit [&_svg]:pointer-events-none [&_svg]:shrink-0',
    menuChoiceRowItemResetClasses,
  ),
)

export type InteractiveListGroupHeadingVariantProps = VariantProps<
  typeof interactiveListGroupHeadingVariants
>
