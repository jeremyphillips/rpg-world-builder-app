import { cn } from '../../lib/utils'
import { fieldArrayItemGutterClasses } from '../../components/ui/field.variants'

/** Left gutter shared by compact and detailed array item rows. */
export { fieldArrayItemGutterClasses }

/** Enables hover/focus reveal for the drag handle on sortable array rows. */
export const arrayItemRowSortableClasses = 'group'

/** Drag handle — hidden until row hover, focus, or active drag. */
export const arrayItemDragHandleClasses =
  'absolute left-0 top-0 flex size-10 shrink-0 cursor-grab items-center justify-center rounded-sm text-muted-foreground opacity-0 transition-opacity duration-150 ease-in-out hover:text-foreground focus-visible:opacity-100 active:cursor-grabbing group-focus-within:opacity-100 group-hover:opacity-100'

/** Keeps the handle visible while a row is being dragged. */
export const arrayItemDragHandleVisibleClasses = 'opacity-100'

/** Remove control — destructive hover treatment. */
export const arrayItemRemoveButtonClasses =
  'size-8 shrink-0 p-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive'

/** Collapse caret button in detailed item headers. */
export const arrayItemCollapseButtonClasses = 'size-8 shrink-0 p-0 text-muted-foreground'

/** Detailed item header title cluster. */
export const arrayItemHeaderTitleClasses =
  'min-w-0 flex-1 truncate text-sm font-medium leading-none'

/** Collapsed summary line in detailed item headers. */
export const arrayItemHeaderSummaryClasses = 'truncate text-xs text-muted-foreground'

/** Toolbar row shared by compact and detailed headers. */
export const arrayItemToolbarRowClasses = 'relative flex min-w-0 items-center gap-1 pr-2'

/** Body region below a detailed item header. */
export const arrayItemBodyClasses = cn(fieldArrayItemGutterClasses, 'pt-3')

/** Inline field region for compact items (same row as toolbar). */
export const arrayItemCompactFieldsClasses = 'min-w-0 flex-1'

/** Applied to the item wrapper while it is being dragged. */
export const arrayItemDraggingClasses = 'opacity-50'
