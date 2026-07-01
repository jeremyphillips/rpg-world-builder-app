import { cn } from '../../lib/utils'

/** Shared 24×24 hit target for grip and collapse caret (WCAG 2.2 AA minimum). */
export const arrayItemChromeButtonClasses =
  'flex size-6 shrink-0 items-center justify-center rounded-sm p-0 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

/** Inline drag handle — precedes caret/title in the toolbar flex row. */
export const arrayItemDragHandleClasses = cn(
  arrayItemChromeButtonClasses,
  '-ml-[calc(var(--spacing)*1)] cursor-grab active:cursor-grabbing',
)

/** Collapse caret in detailed item headers. */
export const arrayItemCollapseButtonClasses = arrayItemChromeButtonClasses

/** Remove control — destructive hover treatment; pinned to the toolbar trailing edge. */
export const arrayItemRemoveButtonClasses =
  'ml-auto size-8 shrink-0 p-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive [&_svg]:size-3.5'

/** Column wrapper for the title row and optional summary row below it. */
export const arrayItemHeaderShellClasses = 'flex min-w-0 flex-col gap-0'

/** Shared flex-1 body slot — title line or compact inline fields. */
export const arrayItemHeaderContentClasses = 'flex min-w-0 flex-1 items-center'

/** Detailed item header title cluster. */
export const arrayItemHeaderTitleClasses =
  'min-w-0 flex-1 truncate text-sm font-medium leading-none'

/** Middle-dot separator between primary and fallback labels. */
export const arrayItemHeaderDividerClasses = 'mx-1.5 text-muted-foreground'

/** Fallback label after the divider (lighter than primary). */
export const arrayItemHeaderFallbackClasses = 'text-xs font-light text-muted-foreground'

/** Summary line below the title row — tight leading; pb-1 separates from item body fields. */
export const arrayItemHeaderSummaryClasses =
  'truncate pb-1 text-xs leading-none text-muted-foreground'

/** Toolbar row shared by compact and detailed headers. */
export const arrayItemToolbarRowClasses = 'relative flex min-w-0 gap-0 pr-2'

/** Space between collapse caret and title / compact fields. */
export const arrayItemToolbarContentClasses = 'min-w-0 flex-1 ml-[calc(var(--spacing)*1)]'

/** Indents summary text to align with the title column start. */
export function arrayItemHeaderSummaryIndentClasses(options: {
  showDragHandle: boolean
  collapsible: boolean
}): string {
  if (options.showDragHandle && options.collapsible) {
    return arrayItemBodySortableCaretIndentClasses
  }
  if (options.collapsible) return arrayItemBodyCaretIndentClasses
  return ''
}

/** Indents collapsible bodies under the title (caret column only). */
export const arrayItemBodyCaretIndentClasses = 'pl-7'

/** Indents collapsible bodies under the title (inline grip + caret columns). */
export const arrayItemBodySortableCaretIndentClasses = 'pl-13'

/** Body region below a detailed item header. */
export function arrayItemBodyClasses(options: { collapsible: boolean; sortable: boolean }): string {
  if (!options.collapsible) return 'pt-3'

  const indent = options.sortable
    ? arrayItemBodySortableCaretIndentClasses
    : arrayItemBodyCaretIndentClasses

  return cn(indent, 'pt-3')
}

/** Inline field region for compact items (same row as toolbar). */
export const arrayItemCompactFieldsClasses = 'min-w-0 flex-1'

/** Applied to the item wrapper while it is being dragged. */
export const arrayItemDraggingClasses = 'opacity-50'
