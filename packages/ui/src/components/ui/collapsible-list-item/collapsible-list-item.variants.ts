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
 * Layout contract: content flows in the main column; trailing actions live in a top-aligned
 * rail pinned to the shell's top-right corner. Leading inset for grip/caret is resolved via
 * `resolveCollapsibleListItemLeadingChrome`.
 */
export const collapsibleListItemShellInsetClasses = 'calc(var(--spacing) * 2)'

/** Shared 24×24 hit target for grip, collapse caret, and remove (WCAG 2.2 AA minimum). */
export const collapsibleListItemChromeButtonClasses =
  'flex size-6 shrink-0 items-center justify-center rounded-sm p-0 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

/** Item shell — border, left/bottom inset; actions rail occupies the top-right with no inset. */
export const collapsibleListItemShellVariants = cva(cn('relative rounded-md border'), {
  variants: {
    layout: {
      default: cn(
        'grid grid-cols-[minmax(0,1fr)_auto] items-start',
        'pl-2 pb-[calc(var(--spacing)*2)] pt-0 pr-0',
      ),
      /** Compact inline row — single column; actions live inside the row grid. */
      compactRow: 'p-2 pt-[calc(var(--spacing)*2)]',
    },
    tone: {
      default: 'border-border',
      subtle: fieldSurfaceToneVariants({ tone: 'subtle' }),
      warning: fieldSurfaceToneVariants({ tone: 'warning' }),
      error: fieldSurfaceToneVariants({ tone: 'error' }),
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

/**
 * Trailing actions rail — top-right of the shell, independent of content height.
 *
 * When `embedded`, the rail sits inside the compact row grid's actions column.
 */
export function collapsibleListItemActionsRailClasses(
  options: { compact?: boolean; embedded?: boolean } = {},
): string {
  return cn(
    'flex shrink-0 items-center gap-1',
    options.embedded
      ? 'justify-self-end'
      : cn('self-start', options.compact ? 'mt-1 mr-1' : 'mt-2 mr-1'),
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
