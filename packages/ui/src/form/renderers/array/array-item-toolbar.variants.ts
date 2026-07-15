import { cn } from '../../../lib/utils'
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
export const arrayItemRemoveButtonClasses = cn(
  arrayItemChromeButtonClasses,
  'text-muted-foreground hover:bg-destructive/10 hover:text-destructive [&_svg]:size-3.5',
)

/** Column wrapper for the title row and optional summary row below it. */
export const arrayItemHeaderShellClasses = 'flex min-w-0 flex-col gap-0'

/** Shared flex-1 body slot — title line or compact inline fields. */
export const arrayItemHeaderContentClasses = 'flex min-w-0 min-h-0 items-center'

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

/** Aligns detailed item bodies with the toolbar content column. */
export const arrayItemBodyClasses = collapsibleListItemBodyClasses

/** Inline field region for compact items (same row as toolbar). */
export const arrayItemCompactFieldsClasses = 'min-w-0 flex-1'

import type { ArrayCompactInlineAlign } from '../../field-config'

/** Compact inline row — grip, fields, and actions share one grid row. */
export function arrayItemCompactRowClasses(align: ArrayCompactInlineAlign = 'start'): string {
  return cn('grid w-full min-w-0 gap-x-2', align === 'center' ? 'items-center' : 'items-start')
}

/** Grip column in the compact row grid. */
export function arrayItemCompactGripClasses(align: ArrayCompactInlineAlign = 'start'): string {
  return cn('flex justify-center', align === 'center' ? 'items-center' : 'items-start')
}

/** Per-field cell in the compact row grid. */
export const arrayItemCompactFieldCellClasses = 'min-w-0'

/**
 * Actions column in the compact row grid — max-content width, never steals field space.
 * Minimum width fits icon+count badge and remove control.
 */
export const arrayItemCompactActionsClasses =
  'w-max min-w-[calc(var(--spacing)*14)] shrink-0 justify-self-end'

/** Full-width row summary below the compact inline field row. */
export const arrayItemCompactSummaryClasses = 'col-span-full min-w-0'

/** Builds `grid-template-columns` for a compact inline row. */
export function buildArrayItemCompactRowGridTemplate(showGrip: boolean): string {
  const grip = showGrip ? 'auto ' : ''
  return `${grip}minmax(0, 1fr) max-content`
}

/** Applied to the item wrapper while it is being dragged. */
export const arrayItemDraggingClasses = collapsibleListItemDraggingClasses
