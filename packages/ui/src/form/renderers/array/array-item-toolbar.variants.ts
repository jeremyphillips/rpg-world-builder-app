import { cn } from '../../../lib/utils'
import { iconGhostControlVariants } from '../../../components/ui/icon-ghost-control.variants'
import {
  collapsibleListItemActionsRailClasses,
  collapsibleListItemBodyClasses,
  collapsibleListItemChromeButtonClasses,
  collapsibleListItemCollapseButtonClasses,
  collapsibleListItemDraggingClasses,
  collapsibleListItemDragHandleClasses,
  collapsibleListItemMainClasses,
  collapsibleListItemShellClasses,
  collapsibleListItemShellInsetClasses,
  collapsibleListItemShellVariants,
  collapsibleListItemToolbarContentClasses,
  collapsibleListItemToolbarRowClasses,
  resolveCollapsibleListItemLeadingChrome,
  type CollapsibleListItemLeadingChromeOptions,
} from '../../../components/ui/collapsible-list-item/collapsible-list-item.variants'

import { collapsibleListItemChromeColumnClasses } from '../../../components/ui/collapsible-list-item/collapsible-list-item-leading-chrome.lib'

export {
  collapsibleListItemChromeColumnClasses as arrayItemChromeColumnClasses,
  resolveCollapsibleListItemLeadingChrome as resolveArrayItemLeadingChrome,
  type CollapsibleListItemLeadingChromeOptions as ArrayItemLeadingChromeOptions,
  type ResolvedCollapsibleListItemLeadingChrome as ResolvedArrayItemLeadingChrome,
} from '../../../components/ui/collapsible-list-item/collapsible-list-item-leading-chrome.lib'

/**
 * Array item chrome geometry — re-exports shared collapsible list item layout tokens.
 *
 * Layout contract: content flows in the main column; trailing actions (remove, issue
 * summary) live in a top-aligned rail pinned to the shell's top-right corner. Leading inset
 * for grip/caret is resolved via `resolveArrayItemLeadingChrome`.
 */
export const arrayItemShellInsetClasses = collapsibleListItemShellInsetClasses

/** Shared 24×24 hit target for grip, collapse caret, and remove (WCAG 2.2 AA minimum). */
export const arrayItemChromeButtonClasses = collapsibleListItemChromeButtonClasses

/** Item shell — border, left/bottom inset; actions rail occupies the top-right with no inset. */
export const arrayItemShellVariants = collapsibleListItemShellVariants

/** Default shell classes — backward-compatible alias for tests and non-context usage. */
export const arrayItemShellClasses = collapsibleListItemShellClasses

/** Main content column — top inset matches shell vertical rhythm. */
export const arrayItemMainClasses = collapsibleListItemMainClasses

/** Trailing actions rail — top-right of the shell, independent of content height. */
export const arrayItemActionsRailClasses = collapsibleListItemActionsRailClasses

/** Inline drag handle — first leading chrome column when sortable. */
export const arrayItemDragHandleClasses = collapsibleListItemDragHandleClasses

/** Collapse caret in detailed item headers. */
export const arrayItemCollapseButtonClasses = collapsibleListItemCollapseButtonClasses

/** Remove control — destructive hover; always last in the actions rail. */
export const arrayItemRemoveButtonClasses = iconGhostControlVariants({
  hover: 'destructiveSubtle',
  layout: 'flex',
})

/** Column wrapper for the title row and optional summary row below it. */
export const arrayItemHeaderShellClasses = 'flex min-w-0 flex-col gap-0'

/** Shared flex-1 body slot — title line or compact inline fields. */
export const arrayItemHeaderContentClasses = 'flex min-w-0 items-center'

/** Detailed item header title cluster. */
export const arrayItemHeaderTitleClasses =
  'min-w-0 flex-1 truncate text-sm font-medium leading-snug'

/** Middle-dot separator between primary and fallback labels. */
export const arrayItemHeaderDividerClasses = 'mx-1.5 text-muted-foreground'

/** Fallback label after the divider (lighter than primary). */
export const arrayItemHeaderFallbackClasses = 'text-xs font-light text-muted-foreground'

/** Summary line below the title row — typography only; spacing owned by CLI header rhythm. */
export const arrayItemHeaderSummaryClasses = 'truncate text-xs leading-snug text-muted-foreground'

/** Leading toolbar row — grip, caret, and title/compact fields only (no trailing actions). */
export const arrayItemToolbarRowClasses = collapsibleListItemToolbarRowClasses

/** Gap before the toolbar content grid cell when leading chrome is visible. */
export const arrayItemToolbarContentClasses = collapsibleListItemToolbarContentClasses

/** Aligns summary text with the toolbar content column. */
export function arrayItemHeaderSummaryIndentClasses(
  options: CollapsibleListItemLeadingChromeOptions,
): string {
  return resolveCollapsibleListItemLeadingChrome(options).contentColumnIndentClasses
}

/** @deprecated Detailed items compose `CollapsibleListItem` — use `collapsibleListItemBodyClasses`. */
export function arrayItemBodyClasses(options: CollapsibleListItemLeadingChromeOptions): string {
  return collapsibleListItemBodyClasses(options)
}

/** Inline field region for compact items (same row as toolbar). */
export const arrayItemCompactFieldsClasses = 'min-w-0 flex-1'

/** Stacked compact row — grip, fields, and actions share one outer grid row. */
export function arrayItemCompactRowClasses(): string {
  return cn('grid w-full min-w-0 items-start gap-x-2')
}

/** Grip column in the stacked compact row grid. */
export function arrayItemCompactGripClasses(): string {
  return cn(collapsibleListItemChromeColumnClasses, 'self-start')
}

/** Field stack cell in the stacked compact row grid. */
export function arrayItemCompactFieldCellClasses(): string {
  return cn('min-w-0 self-start')
}

/** Actions column in the stacked compact row grid — content-sized, never steals field space. */
export function arrayItemCompactActionsClasses(): string {
  return cn('flex w-max shrink-0 items-center justify-self-end self-start')
}

/** Full-width row summary below the compact inline field row. */
export const arrayItemCompactSummaryClasses = 'col-span-full min-w-0'

/** Builds `grid-template-columns` for a compact inline row. */
export function buildArrayItemCompactRowGridTemplate(showGrip: boolean): string {
  const grip = showGrip ? 'auto ' : ''
  return `${grip}minmax(0, 1fr) max-content`
}

/** Applied to the item wrapper while it is being dragged. */
export const arrayItemDraggingClasses = collapsibleListItemDraggingClasses

/** Flat non-collapsible shells — subtle wash with tighter corner radius. */
export const arrayItemFlatShellRadiusClasses = 'rounded-sm'

/** Merged flat list — collapse adjacent borders between siblings. */
export function arrayItemFlatMergedShellClasses(
  position: 'only' | 'first' | 'middle' | 'last',
): string {
  if (position === 'only') return arrayItemFlatShellRadiusClasses
  if (position === 'first') return cn(arrayItemFlatShellRadiusClasses, 'rounded-b-none')
  if (position === 'last') return cn(arrayItemFlatShellRadiusClasses, '-mt-px rounded-t-none')
  return cn(arrayItemFlatShellRadiusClasses, '-mt-px rounded-none')
}

/** Unlabeled stacked body — grip column beside a field stack. */
export function arrayItemUnlabeledStackedRowClasses(): string {
  return cn('grid w-full min-w-0 items-start gap-x-2')
}

export function arrayItemUnlabeledStackedGridTemplate(reserveDragHandleSlot: boolean): string {
  return reserveDragHandleSlot ? 'auto minmax(0, 1fr)' : 'minmax(0, 1fr)'
}
