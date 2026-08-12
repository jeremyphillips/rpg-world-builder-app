import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import { iconGhostControlVariants } from './icon-ghost-control.variants'

/** Keeps hover-reveal handles visible for the duration of an active drag. */
export const dragHandleVisibleWhileDraggingClasses = 'opacity-100'

const dragHandleHoverRevealRevealClasses =
  'opacity-0 transition-opacity duration-150 ease-in-out focus-visible:opacity-100 group-focus-within:opacity-100 group-hover:opacity-100'

/**
 * Sortable grip chrome — always-visible (CLI/array) or hover-reveal (master-detail).
 * Both visibilities share compact control-action geometry and embedded focus (F7).
 * Hosts with `hoverReveal` must provide a `group` (or agreed group name) on the row root.
 */
export const dragHandleVariants = cva('', {
  variants: {
    visibility: {
      always: '',
      hoverReveal: '',
    },
    dragging: {
      true: dragHandleVisibleWhileDraggingClasses,
      false: '',
    },
  },
  compoundVariants: [
    {
      visibility: 'always',
      class: cn(
        iconGhostControlVariants({ hover: 'text', layout: 'flex' }),
        'cursor-grab active:cursor-grabbing',
      ),
    },
    {
      visibility: 'hoverReveal',
      class: cn(
        iconGhostControlVariants({ hover: 'text', layout: 'flex' }),
        'cursor-grab active:cursor-grabbing',
        dragHandleHoverRevealRevealClasses,
      ),
    },
  ],
  defaultVariants: {
    visibility: 'always',
    dragging: false,
  },
})

export type DragHandleVariantProps = VariantProps<typeof dragHandleVariants>
