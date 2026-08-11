import { cn, dragHandleVariants, dragSurfaceVariants, interactiveRowVariants } from '@rpg/ui'

/** Outer row layout — host-owned inset for embedded EntityItem. */
export const masterDetailListRowLayoutClasses =
  'flex items-center gap-0 rounded-md border border-transparent px-3 py-2'

/** Enables hover/focus reveal for the drag handle in sortable rows. */
export const masterDetailListRowSortableClasses = 'group'

export function masterDetailListRowSurfaceClasses(options: {
  active?: boolean
  isSelected: boolean
}): string {
  const active = options.active !== false

  return interactiveRowVariants({
    interaction: 'hoverable',
    state: active ? 'default' : 'inactive',
    hoverFamily: options.isSelected ? 'none' : 'selectable',
    selected: options.isSelected ? 'bordered' : 'none',
    selectedHover: options.isSelected ? 'row' : 'none',
  })
}

/** Host-local leading inset for the sortable grip column. */
export const masterDetailListDragHandleInsetClasses = 'ml-0.5'

export function masterDetailListDragHandleClasses(isDragging = false): string {
  return cn(
    masterDetailListDragHandleInsetClasses,
    dragHandleVariants({ visibility: 'hoverReveal', dragging: isDragging }),
  )
}

/** Selectable label region inside a row. */
export const masterDetailListRowSelectClasses = 'min-w-0 flex-1 rounded-md text-left'

/** Applied to the row wrapper while it is being dragged. */
export const masterDetailListRowDraggingClasses = dragSurfaceVariants({ dragging: true })
