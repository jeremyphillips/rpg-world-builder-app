import { cva, type VariantProps } from 'class-variance-authority'

/**
 * Orthogonal row interaction policy — capability (hover), semantic state, and drag feedback.
 * Hosts own layout, inset, separators, and left-rail accents; they compose this for fills only.
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
    hoverTone: {
      none: '',
      row: '',
      muted: '',
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
    dragging: {
      true: 'opacity-50',
      false: '',
    },
  },
  compoundVariants: [
    {
      interaction: 'hoverable',
      hoverTone: 'row',
      selected: 'none',
      class: 'hover:bg-row-hover',
    },
    {
      interaction: 'hoverable',
      hoverTone: 'muted',
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
    hoverTone: 'row',
    selected: 'none',
    selectedHover: 'none',
    selectedData: 'none',
    dragging: false,
  },
})

export type InteractiveRowVariantProps = VariantProps<typeof interactiveRowVariants>
