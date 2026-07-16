import { cva } from 'class-variance-authority'

import { cn } from '../../../lib/utils'
import { fieldSurfaceToneVariants } from '../field-stack.variants'
import {
  resolveCollapsibleListItemLeadingChrome,
  type CollapsibleListItemLeadingChromeOptions,
} from './collapsible-list-item-leading-chrome.lib'

export {
  collapsibleListItemChromeColumnClasses,
  resolveCollapsibleListItemLeadingChrome,
  type CollapsibleListItemLeadingChromeOptions,
  type ResolvedCollapsibleListItemLeadingChrome,
} from './collapsible-list-item-leading-chrome.lib'

/**
 * Collapsible list item chrome geometry — shell padding and action hit targets.
 *
 * Layout contract:
 * - Shell owns fixed box insets via `collapsibleListItemShellPaddingClasses`.
 * - Leading inset for summary/body aligns with toolbar content via
 *   `resolveCollapsibleListItemLeadingChrome`.
 * - Array items use a two-column grid so the actions rail shares row 1 only;
 *   catalog rows use a flex header row with summary/body stacked below.
 */
export const collapsibleListItemShellInsetClasses = 'calc(var(--spacing) * 2)'

/** Fixed shell padding — inline-start matches legacy inset; inline-end/block-end use spacing 3. */
export const collapsibleListItemShellPaddingClasses = cn('pl-2 pr-3 pb-3 pt-0')

/** Shared 24×24 hit target for grip, collapse caret, and remove (WCAG 2.2 AA minimum). */
export const collapsibleListItemChromeButtonClasses =
  'flex size-6 shrink-0 items-center justify-center rounded-sm p-0 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

/** Item shell — border and shell padding; actions rail sits inside padded box on row 1. */
export const collapsibleListItemShellVariants = cva(cn('relative rounded-md border'), {
  variants: {
    layout: {
      default: cn(
        'grid grid-cols-[minmax(0,1fr)_auto] items-start',
        collapsibleListItemShellPaddingClasses,
      ),
      /** Flex header row + stacked summary/body — catalog picker rows. */
      headerActions: cn('flex flex-col', collapsibleListItemShellPaddingClasses),
      /** Compact inline row — single column; actions live inside the row grid. */
      compactRow: cn(collapsibleListItemShellPaddingClasses, 'pt-[calc(var(--spacing)*2)]'),
    },
    tone: {
      default: 'border-border',
      main: fieldSurfaceToneVariants({ tone: 'main' }),
      elevated: fieldSurfaceToneVariants({ tone: 'elevated' }),
      subtle: fieldSurfaceToneVariants({ tone: 'subtle' }),
      medium: fieldSurfaceToneVariants({ tone: 'medium' }),
      warning: fieldSurfaceToneVariants({ tone: 'warning' }),
      error: fieldSurfaceToneVariants({ tone: 'error' }),
      /** Catalog picker row header — muted wash tuned for collapsible item shells. */
      catalog: 'border-border bg-catalog-picker-row-surface',
    },
  },
  defaultVariants: {
    layout: 'default',
    tone: 'default',
  },
})

/** Default shell classes — backward-compatible alias for tests and non-context usage. */
export const collapsibleListItemShellClasses = collapsibleListItemShellVariants({ tone: 'default' })

/** Main content column — top inset matches shell vertical rhythm. */
export const collapsibleListItemMainClasses = 'min-w-0 pt-[calc(var(--spacing)*2)]'

/** Toolbar + actions on one row when actions center on the title row only. */
export const collapsibleListItemHeaderRowClasses = cn(
  'flex w-full min-w-0 items-center gap-2',
  'pt-[calc(var(--spacing)*2)]',
)

/** Summary below the header row — left indent matches body/content column. */
export function collapsibleListItemHeaderSummaryClasses(
  options: CollapsibleListItemLeadingChromeOptions,
): string {
  return cn('min-w-0', resolveCollapsibleListItemLeadingChrome(options).contentColumnIndentClasses)
}

/**
 * Trailing actions rail — top-right of the shell, independent of content height.
 *
 * When `embedded`, the rail sits inside the compact row grid's actions column.
 * When `centered`, the rail vertically centers against the toolbar row only.
 */
export function collapsibleListItemActionsRailClasses(
  options: { compact?: boolean; embedded?: boolean; centered?: boolean } = {},
): string {
  return cn(
    'flex shrink-0 items-center gap-1',
    options.embedded
      ? 'justify-self-end'
      : options.centered
        ? 'shrink-0'
        : cn('self-start', options.compact ? 'mt-1' : 'mt-2'),
  )
}

/** Inline drag handle — first leading chrome column when sortable. */
export function collapsibleListItemDragHandleClasses(options: { compact?: boolean } = {}): string {
  return cn(
    collapsibleListItemChromeButtonClasses,
    'cursor-grab active:cursor-grabbing',
    options.compact && '-mt-1',
  )
}

/** Collapse caret in detailed item headers. */
export const collapsibleListItemCollapseButtonClasses = collapsibleListItemChromeButtonClasses

/** Leading toolbar row — grip, caret, and title/compact fields only (no trailing actions). */
export function collapsibleListItemToolbarRowClasses(
  options: CollapsibleListItemLeadingChromeOptions & { compact?: boolean },
): string {
  return cn('flex min-w-0 gap-0', options.compact ? 'items-start' : 'items-center')
}

/** Gap before the toolbar content grid cell when leading chrome is visible. */
export function collapsibleListItemToolbarContentClasses(
  options: CollapsibleListItemLeadingChromeOptions,
): string {
  return cn('min-w-0', resolveCollapsibleListItemLeadingChrome(options).toolbarContentGapClasses)
}

/** Aligns detailed item bodies with the toolbar content column. */
export function collapsibleListItemBodyClasses(
  options: CollapsibleListItemLeadingChromeOptions,
): string {
  return cn(resolveCollapsibleListItemLeadingChrome(options).contentColumnIndentClasses, 'pt-3')
}

/** Applied to the item wrapper while it is being dragged. */
export const collapsibleListItemDraggingClasses = 'opacity-50'
