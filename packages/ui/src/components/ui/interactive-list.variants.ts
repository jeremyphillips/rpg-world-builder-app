import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import { borderStrength } from './border-strength'
import { listShellClasses } from './list-density.lib'
import type { ListDensity } from './list-density.tokens'
import {
  UI_INTERACTIVE_ROW_BLOCK_CLASS,
  UI_INTERACTIVE_ROW_FILL_SURFACE_CLASS,
  UI_INTERACTIVE_ROW_STATE_CLASS,
} from './interactive-row.styles'
import {
  selectableRowHighlightRailClasses,
  selectableRowListHighlightSelectedClasses,
  selectableRowListHighlightUnselectedClasses,
  selectableRowListPointerHoverClasses,
} from './interactive-row.variants'

/** List surface. Adjacent-sibling borders live on `.ui-interactive-list`. */
export const interactiveListSurfaceClasses = cn('ui-interactive-list', borderStrength('subtle'))

/** Row-list shell — wrap row adapters only (not labels/separators). */
export function interactiveListVariants(density: ListDensity = 'comfortable'): string {
  return cn(listShellClasses(density), interactiveListSurfaceClasses)
}

/** Shared panel shell for combobox popovers and choice menus (animation composed per host). */
export const interactiveListPanelVariants = cva(
  cn('ui-interactive-list__panel shadow-md', borderStrength()),
  {
    variants: {
      triggerWidth: {
        match: 'ui-interactive-list__panel--match',
        fit: 'ui-interactive-list__panel--fit',
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
export const interactiveListRowChromeVariants = cva(
  cn('ui-interactive-list__row', UI_INTERACTIVE_ROW_BLOCK_CLASS),
  {
    variants: {
      highlighted: {
        true: '',
        false: '',
      },
      selected: {
        true: UI_INTERACTIVE_ROW_FILL_SURFACE_CLASS,
        false: '',
      },
      disabled: {
        true: UI_INTERACTIVE_ROW_STATE_CLASS.disabled,
        false: '',
      },
      interactive: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      {
        highlighted: true,
        selected: false,
        className: cn(
          selectableRowListHighlightUnselectedClasses,
          selectableRowHighlightRailClasses,
        ),
      },
      {
        highlighted: true,
        selected: true,
        className: cn(selectableRowListHighlightSelectedClasses, selectableRowHighlightRailClasses),
      },
      {
        interactive: true,
        selected: false,
        className: selectableRowListPointerHoverClasses,
      },
    ],
    defaultVariants: {
      highlighted: false,
      selected: false,
      disabled: false,
      interactive: true,
    },
  },
)

/** Main hit area — identity and decorative trailing chrome. */
export const interactiveListRowMainVariants = cva('ui-interactive-list__main', {
  variants: {
    interactive: {
      true: 'ui-interactive-list__main--interactive',
      false: '',
    },
  },
  defaultVariants: {
    interactive: true,
  },
})
