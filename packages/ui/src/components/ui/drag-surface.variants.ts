import { cva, type VariantProps } from 'class-variance-authority'

/** Standard sortable-row drag feedback — shared by collapsible list items and master-detail rows. */
export const dragSurfaceDraggingOpacityClasses = 'opacity-50'

/**
 * Surface opacity while a sortable row/item is being dragged.
 * Bench score-token and other products may use different values — see follow-up normalization.
 */
export const dragSurfaceVariants = cva('', {
  variants: {
    dragging: {
      true: dragSurfaceDraggingOpacityClasses,
      false: '',
    },
  },
  defaultVariants: {
    dragging: false,
  },
})

export type DragSurfaceVariantProps = VariantProps<typeof dragSurfaceVariants>
