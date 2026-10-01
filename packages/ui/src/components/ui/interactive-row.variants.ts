import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import { interactivePointerClasses } from './interactive-focus.variants'

/**
 * Selectable/navigable list row interaction family — neutral `--row-hover-bg` fill.
 * Host semantics (link, option, menuitem) stay on the adapter; compose these for wash/rail only.
 */
export const selectableRowPointerHoverClasses = 'hover:bg-row-hover'

export const selectableRowHighlightFillClasses = 'bg-row-hover'

export const selectableRowMenuHighlightFillClasses =
  'data-[highlighted]:bg-row-hover data-[highlighted]:text-foreground'

/** Accent rail for keyboard/list highlight — independent of row-hover fill. */
export const selectableRowHighlightRailClasses = cn(
  'before:absolute before:inset-y-0 before:left-0 before:w-0.5 before:content-[""]',
  'before:bg-accent',
)

export const selectableRowMenuHighlightRailClasses = cn(
  'before:absolute before:inset-y-0 before:left-0 before:w-0.5 before:bg-transparent before:content-[""]',
  'data-[highlighted]:before:bg-accent',
)

/** Resets generic DropdownMenuItem control styling before selectable-row chrome. */
export const menuChoiceRowItemResetClasses = cn(
  'rounded-none shadow-none outline-none',
  'focus:bg-transparent focus:text-foreground',
  'hover:bg-transparent',
  'data-[highlighted]:focus:bg-row-hover',
)

/**
 * Orthogonal row interaction policy — capability (hover), semantic state, and selection fills.
 * Hosts own layout, inset, separators, and left-rail accents; they compose this for fills only.
 *
 * Sortable drag opacity belongs on `dragSurfaceVariants`, not here.
 */
export const interactiveRowVariants = cva('transition-colors', {
  variants: {
    interaction: {
      static: '',
      hoverable: '',
    },
    state: {
      default: '',
      inactive: 'border-dashed border-border-subtle',
      disabled: 'pointer-events-none opacity-50',
    },
    hoverFamily: {
      none: '',
      selectable: '',
      navigation: '',
    },
    selected: {
      none: '',
      bordered: 'border-row-selected-border bg-row-selected',
      fill: 'bg-row-selected',
    },
    selectedHover: {
      none: '',
      row: 'hover:bg-row-selected',
    },
    selectedData: {
      none: '',
      selected: 'data-[state=selected]:bg-row-selected',
      checked: 'data-[state=checked]:bg-row-selected',
    },
    hitTarget: {
      none: '',
      pointer: interactivePointerClasses,
    },
  },
  compoundVariants: [
    {
      interaction: 'hoverable',
      hoverFamily: 'selectable',
      selected: 'none',
      class: 'hover:bg-row-hover',
    },
    {
      interaction: 'hoverable',
      hoverFamily: 'navigation',
      selected: 'none',
      class: 'hover:bg-muted',
    },
    {
      selected: 'bordered',
      selectedHover: 'row',
      class: 'hover:bg-row-selected',
    },
  ],
  defaultVariants: {
    interaction: 'hoverable',
    state: 'default',
    hoverFamily: 'selectable',
    selected: 'none',
    selectedHover: 'none',
    selectedData: 'none',
    hitTarget: 'none',
  },
})

export type InteractiveRowVariantProps = VariantProps<typeof interactiveRowVariants>
