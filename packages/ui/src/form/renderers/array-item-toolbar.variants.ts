import { cn } from '../../lib/utils'
import { fieldArrayItemGutterClasses } from '../../components/ui/field.variants'

/** Left gutter shared by compact and detailed array item rows. */
export { fieldArrayItemGutterClasses }

/** Drag handle — sits in the pl-10 gutter on sortable rows. */
export const arrayItemDragHandleClasses =
  'absolute -left-10 top-1/2 flex size-10 shrink-0 -translate-y-1/2 cursor-grab items-center justify-center rounded-sm text-muted-foreground hover:text-foreground active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

/** Remove control — destructive hover treatment. */
export const arrayItemRemoveButtonClasses =
  'size-8 shrink-0 p-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive'

/** Collapse caret button in detailed item headers. */
export const arrayItemCollapseButtonClasses = 'size-8 shrink-0 p-0 text-muted-foreground'

/** Detailed item header title cluster. */
export const arrayItemHeaderTitleClasses =
  'min-w-0 flex-1 truncate text-sm font-medium leading-none'

/** Middle-dot separator between primary and fallback labels. */
export const arrayItemHeaderDividerClasses = 'mx-1.5 text-muted-foreground'

/** Fallback label after the divider (lighter than primary). */
export const arrayItemHeaderFallbackClasses = 'text-xs font-light text-muted-foreground'

/** Collapsed summary line in detailed item headers. */
export const arrayItemHeaderSummaryClasses = 'truncate text-xs text-muted-foreground'

/** Toolbar row shared by compact and detailed headers. */
export const arrayItemToolbarRowClasses = 'relative flex min-w-0 items-center gap-1 pr-2'

/** Body region below a detailed item header. */
export function arrayItemBodyClasses(options: { collapsible: boolean }): string {
  return cn(options.collapsible && fieldArrayItemGutterClasses, 'pt-3')
}

/** Inline field region for compact items (same row as toolbar). */
export const arrayItemCompactFieldsClasses = 'min-w-0 flex-1'

/** Applied to the item wrapper while it is being dragged. */
export const arrayItemDraggingClasses = 'opacity-50'
