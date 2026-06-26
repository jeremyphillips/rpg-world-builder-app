/** Outer row chrome shared by every list item. */
export const masterDetailListRowClasses =
  'flex items-center gap-1 rounded-md border border-transparent hover:bg-muted/60'

/** Selected row — same footprint as hover, stronger fill + border. */
export const masterDetailListRowSelectedClasses = 'border-border bg-muted/40 hover:bg-muted/40'

/** Inactive row — dashed border and muted title (matches subclass list). */
export const masterDetailListRowInactiveClasses = 'border-dashed border-border/60'

export const masterDetailListRowInactiveTitleClasses = 'text-muted-foreground'

/** Drag handle control in a master-detail list row. */
export const masterDetailListDragHandleClasses =
  'flex size-8 shrink-0 cursor-grab items-center justify-center rounded text-muted-foreground hover:text-foreground active:cursor-grabbing'

/** Selectable label region inside a row. */
export const masterDetailListRowSelectClasses =
  'min-w-0 flex-1 rounded-md px-3 py-2 text-left text-sm'

/** Applied to the row wrapper while it is being dragged. */
export const masterDetailListRowDraggingClasses = 'opacity-50'
