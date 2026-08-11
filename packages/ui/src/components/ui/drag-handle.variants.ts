import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import { iconGhostControlVariants } from './icon-ghost-control.variants'

/** Keeps hover-reveal handles visible for the duration of an active drag. */
export const dragHandleVisibleWhileDraggingClasses = 'opacity-100'

/**
 * Sortable grip chrome — always-visible (CLI/array) or hover-reveal (master-detail).
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
        iconGhostControlVariants({ size: 'compact', hover: 'text', layout: 'flex' }),
        'cursor-grab active:cursor-grabbing',
      ),
    },
    {
      visibility: 'hoverReveal',
      class:
        'flex size-6 shrink-0 cursor-grab items-center justify-center rounded-sm text-muted-foreground opacity-0 transition-opacity duration-150 ease-in-out hover:text-foreground focus-visible:opacity-100 active:cursor-grabbing group-focus-within:opacity-100 group-hover:opacity-100',
    },
  ],
  defaultVariants: {
    visibility: 'always',
    dragging: false,
  },
})

export type DragHandleVariantProps = VariantProps<typeof dragHandleVariants>
