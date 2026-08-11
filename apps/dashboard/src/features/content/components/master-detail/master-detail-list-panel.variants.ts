import { interactiveRowVariants } from '@rpg/ui'

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
    hoverTone: options.isSelected ? 'none' : 'row',
    selected: options.isSelected ? 'bordered' : 'none',
    selectedHover: options.isSelected ? 'row' : 'none',
  })
}

/** Drag handle — hidden until row hover, focus, or active drag. Phase 2: dragHandleVariants. */
export const masterDetailListDragHandleClasses =
  'ml-0.5 flex size-6 shrink-0 cursor-grab items-center justify-center rounded-sm text-muted-foreground opacity-0 transition-opacity duration-150 ease-in-out hover:text-foreground focus-visible:opacity-100 active:cursor-grabbing group-focus-within:opacity-100 group-hover:opacity-100'

/** Keeps the handle visible while a row is being dragged. */
export const masterDetailListDragHandleVisibleClasses = 'opacity-100'

/** Selectable label region inside a row. */
export const masterDetailListRowSelectClasses = 'min-w-0 flex-1 rounded-md text-left'

/** Applied to the row wrapper while it is being dragged. */
export const masterDetailListRowDraggingClasses = interactiveRowVariants({ dragging: true })
