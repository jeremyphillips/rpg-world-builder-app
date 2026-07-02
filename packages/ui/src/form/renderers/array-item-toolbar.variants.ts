import { cva } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import { fieldSurfaceToneVariants } from '../../components/ui/field-stack.variants'
import {
  resolveArrayItemLeadingChrome,
  type ArrayItemLeadingChromeOptions,
} from '../config/array-item-leading-chrome.lib'

export {
  arrayItemChromeColumnClasses,
  resolveArrayItemLeadingChrome,
  type ArrayItemLeadingChromeOptions,
  type ResolvedArrayItemLeadingChrome,
} from '../config/array-item-leading-chrome.lib'

/**
 * Array item chrome geometry — single source of truth for shell padding and action hit targets.
 *
 * Layout contract: content flows in the main column; trailing actions (remove, future issue
 * summary) live in a top-aligned rail pinned to the shell's top-right corner. Leading inset for
 * grip/caret is resolved via `resolveArrayItemLeadingChrome`.
 */
export const arrayItemShellInsetClasses = 'calc(var(--spacing) * 2)'

/** Shared 24×24 hit target for grip, collapse caret, and remove (WCAG 2.2 AA minimum). */
export const arrayItemChromeButtonClasses =
  'flex size-6 shrink-0 items-center justify-center rounded-sm p-0 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

/** Item shell — border, left/bottom inset; actions rail occupies the top-right with no inset. */
export const arrayItemShellVariants = cva(cn('relative rounded-md border'), {
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
export const arrayItemShellClasses = arrayItemShellVariants({ tone: 'default' })

/** Main content column — top inset matches shell vertical rhythm. */
export const arrayItemMainClasses = 'min-w-0 pt-[calc(var(--spacing)*2)]'

/**
 * Trailing actions rail — top-right of the shell, independent of content height.
 *
 * When `embedded`, the rail sits inside the compact row grid's actions column.
 */
export function arrayItemActionsRailClasses(
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
export function arrayItemDragHandleClasses(options: { compact?: boolean } = {}): string {
  return cn(
    arrayItemChromeButtonClasses,
    'cursor-grab active:cursor-grabbing',
    options.compact && '-mt-1',
  )
}

/** Collapse caret in detailed item headers. */
export const arrayItemCollapseButtonClasses = arrayItemChromeButtonClasses

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
export function arrayItemToolbarRowClasses(
  options: ArrayItemLeadingChromeOptions & { compact?: boolean },
): string {
  return cn('flex min-w-0 gap-0', options.compact ? 'items-start' : 'items-center')
}

/** Gap before the toolbar content grid cell when leading chrome is visible. */
export function arrayItemToolbarContentClasses(options: ArrayItemLeadingChromeOptions): string {
  return cn('min-w-0', resolveArrayItemLeadingChrome(options).toolbarContentGapClasses)
}

/** Aligns summary text with the toolbar content column. */
export function arrayItemHeaderSummaryIndentClasses(
  options: ArrayItemLeadingChromeOptions,
): string {
  return resolveArrayItemLeadingChrome(options).contentColumnIndentClasses
}

/** Aligns detailed item bodies with the toolbar content column. */
export function arrayItemBodyClasses(options: ArrayItemLeadingChromeOptions): string {
  return cn(resolveArrayItemLeadingChrome(options).contentColumnIndentClasses, 'pt-3')
}

/** Inline field region for compact items (same row as toolbar). */
export const arrayItemCompactFieldsClasses = 'min-w-0 flex-1'

/** Compact inline row — grip, fields, and actions share one grid row. */
export const arrayItemCompactRowClasses = 'grid w-full min-w-0 items-start gap-x-2'

/** Grip column in the compact row grid. */
export const arrayItemCompactGripClasses = 'flex items-start justify-center'

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
export function buildArrayItemCompactRowGridTemplate(
  fieldCount: number,
  showGrip: boolean,
): string {
  const grip = showGrip ? 'auto ' : ''
  return `${grip}repeat(${fieldCount}, minmax(0, 1fr)) max-content`
}

/** Applied to the item wrapper while it is being dragged. */
export const arrayItemDraggingClasses = 'opacity-50'
