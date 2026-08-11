import { cva, type VariantProps } from 'class-variance-authority'

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
  },
})

export type InteractiveRowVariantProps = VariantProps<typeof interactiveRowVariants>
