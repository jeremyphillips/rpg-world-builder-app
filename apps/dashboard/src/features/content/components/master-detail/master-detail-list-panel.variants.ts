/** Outer row chrome shared by every list item — host-owned inset for embedded EntityItem. */
export const masterDetailListRowClasses =
  'flex items-center gap-0 rounded-md border border-transparent px-3 py-2 hover:bg-row-hover'

/** Enables hover/focus reveal for the drag handle in sortable rows. */
export const masterDetailListRowSortableClasses = 'group'

/** Selected row — same footprint as hover, stronger fill + border. */
export const masterDetailListRowSelectedClasses =
  'border-row-selected-border bg-row-selected hover:bg-row-selected'

/** Inactive row — dashed border and muted title (matches subclass list). */
export const masterDetailListRowInactiveClasses = 'border-dashed border-border-subtle'

/** Drag handle — hidden until row hover, focus, or active drag. */
export const masterDetailListDragHandleClasses =
  'ml-0.5 flex size-6 shrink-0 cursor-grab items-center justify-center rounded-sm text-muted-foreground opacity-0 transition-opacity duration-150 ease-in-out hover:text-foreground focus-visible:opacity-100 active:cursor-grabbing group-focus-within:opacity-100 group-hover:opacity-100'

/** Keeps the handle visible while a row is being dragged. */
export const masterDetailListDragHandleVisibleClasses = 'opacity-100'

/** Selectable label region inside a row. */
export const masterDetailListRowSelectClasses = 'min-w-0 flex-1 rounded-md text-left'

/** Applied to the row wrapper while it is being dragged. */
export const masterDetailListRowDraggingClasses = 'opacity-50'
