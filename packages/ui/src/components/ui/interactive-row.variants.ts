import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import {
  UI_INTERACTIVE_ROW_BLOCK_CLASS,
  UI_INTERACTIVE_ROW_DATA_CLASS,
  UI_INTERACTIVE_ROW_HIGHLIGHT_CLASS,
  UI_INTERACTIVE_ROW_HIT_CLASS,
  UI_INTERACTIVE_ROW_HOVER_CLASS,
  UI_INTERACTIVE_ROW_LIST_HIGHLIGHT_SELECTED_CLASS,
  UI_INTERACTIVE_ROW_LIST_HIGHLIGHT_UNSELECTED_CLASS,
  UI_INTERACTIVE_ROW_RAIL_CLASS,
  UI_INTERACTIVE_ROW_SELECTED_CLASS,
  UI_INTERACTIVE_ROW_STATE_CLASS,
} from './interactive-row.styles'

/** Pointer hover for selectable rows. Hosts compose this; the wash lives in interactive-row.css. */
export const selectableRowPointerHoverClasses = cn(
  UI_INTERACTIVE_ROW_BLOCK_CLASS,
  UI_INTERACTIVE_ROW_HOVER_CLASS.hover,
)

export const selectableRowHighlightFillClasses = UI_INTERACTIVE_ROW_HIGHLIGHT_CLASS

/** Pointer hover for `InteractiveListRow` — mixes from the list shell `--ui-surface-bg`. */
export const selectableRowListPointerHoverClasses = cn(
  UI_INTERACTIVE_ROW_BLOCK_CLASS,
  UI_INTERACTIVE_ROW_HOVER_CLASS.hover,
)

export const selectableRowListHighlightUnselectedClasses =
  UI_INTERACTIVE_ROW_LIST_HIGHLIGHT_UNSELECTED_CLASS

export const selectableRowListHighlightSelectedClasses =
  UI_INTERACTIVE_ROW_LIST_HIGHLIGHT_SELECTED_CLASS

/** Accent rail for keyboard/list highlight — independent of row-hover fill. */
export const selectableRowHighlightRailClasses = UI_INTERACTIVE_ROW_RAIL_CLASS

/**
 * Orthogonal row interaction policy — capability (hover), semantic state, and selection fills.
 * Hosts own layout, inset, separators, and left-rail accents; they compose this for fills only.
 *
 * Sortable drag opacity belongs on `dragSurfaceVariants`, not here.
 */
export const interactiveRowVariants = cva(UI_INTERACTIVE_ROW_BLOCK_CLASS, {
  variants: {
    interaction: {
      static: '',
      hoverable: '',
    },
    state: {
      default: UI_INTERACTIVE_ROW_STATE_CLASS.default,
      inactive: UI_INTERACTIVE_ROW_STATE_CLASS.inactive,
      disabled: UI_INTERACTIVE_ROW_STATE_CLASS.disabled,
    },
    selected: {
      none: UI_INTERACTIVE_ROW_SELECTED_CLASS.none,
      bordered: UI_INTERACTIVE_ROW_SELECTED_CLASS.bordered,
      fill: UI_INTERACTIVE_ROW_SELECTED_CLASS.fill,
    },
    selectedData: {
      none: UI_INTERACTIVE_ROW_DATA_CLASS.none,
      selected: UI_INTERACTIVE_ROW_DATA_CLASS.selected,
      checked: UI_INTERACTIVE_ROW_DATA_CLASS.checked,
    },
    hitTarget: {
      none: UI_INTERACTIVE_ROW_HIT_CLASS.none,
      pointer: UI_INTERACTIVE_ROW_HIT_CLASS.pointer,
    },
  },
  compoundVariants: [
    {
      interaction: 'hoverable',
      selected: 'none',
      class: UI_INTERACTIVE_ROW_HOVER_CLASS.hover,
    },
  ],
  defaultVariants: {
    interaction: 'hoverable',
    state: 'default',
    selected: 'none',
    selectedData: 'none',
    hitTarget: 'none',
  },
})

export type InteractiveRowVariantProps = VariantProps<typeof interactiveRowVariants>
