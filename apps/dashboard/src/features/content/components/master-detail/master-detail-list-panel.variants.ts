/** Outer row chrome shared by every list item. */
export const masterDetailListRowClasses =
  'flex items-center gap-0 rounded-md border border-transparent hover:bg-muted/60'

/** Enables hover/focus reveal for the drag handle in sortable rows. */
export const masterDetailListRowSortableClasses = 'group'

/** Selected row — same footprint as hover, stronger fill + border. */
export const masterDetailListRowSelectedClasses = 'border-border bg-muted/40 hover:bg-muted/40'

/** Inactive row — dashed border and muted title (matches subclass list). */
export const masterDetailListRowInactiveClasses = 'border-dashed border-border/60'

export const masterDetailListRowInactiveTitleClasses = 'text-muted-foreground'

/** Drag handle — hidden until row hover, focus, or active drag. */
export const masterDetailListDragHandleClasses =
  'ml-0.5 flex size-6 shrink-0 cursor-grab items-center justify-center rounded-sm text-muted-foreground opacity-0 transition-opacity duration-150 ease-in-out hover:text-foreground focus-visible:opacity-100 active:cursor-grabbing group-focus-within:opacity-100 group-hover:opacity-100'

/** Keeps the handle visible while a row is being dragged. */
export const masterDetailListDragHandleVisibleClasses = 'opacity-100'

/** Selectable label region inside a row. */
export const masterDetailListRowSelectClasses = 'min-w-0 flex-1 rounded-md py-2 text-left text-sm'

/** Left inset when a drag handle precedes the label. */
export const masterDetailListRowSelectWithDragClasses = 'pl-1.5 pr-3'

/** Horizontal inset when the row has no drag handle. */
export const masterDetailListRowSelectDefaultPaddingClasses = 'px-3'

/** Applied to the row wrapper while it is being dragged. */
export const masterDetailListRowDraggingClasses = 'opacity-50'
