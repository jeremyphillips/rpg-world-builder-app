import { cva } from 'class-variance-authority'

import { cn } from '../../../lib/utils'
import { controlActionCompactIconClasses } from '../control-action.variants'
import { establishSurfaceCurrent } from '../surface-current.lib'
import {
  resolveCollapsibleListItemLeadingChrome,
  type CollapsibleListItemLeadingChromeOptions,
} from './collapsible-list-item-leading-chrome.lib'

export type CollapsibleListItemShellPreset = 'default' | 'catalog'

export {
  collapsibleListItemChromeColumnClasses,
  resolveCollapsibleListItemLeadingChrome,
  buildCollapsibleListItemLeadingChromeStyle,
  collapsibleListItemContentColumnIndentClasses,
  collapsibleListItemContentInlineStartClasses,
  LEADING_CHROME_COUNT_VAR,
  CONTENT_COLUMN_INDENT_VAR,
  CONTENT_INLINE_START_VAR,
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
export const collapsibleListItemChromeButtonClasses = cn(
  'flex shrink-0 items-center justify-center rounded-sm p-0 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
  controlActionCompactIconClasses,
)

/** Catalog row shell — drop default bottom pad; expanded body owns vertical rhythm. */
export const collapsibleListItemCatalogShellExtraClasses = 'pb-0'

/** Entity-card host — catalog shell keeps border/bg but drops content-area inset. */
export const collapsibleListItemEntityCardShellPaddingClasses = 'p-0'

/** Entity-card host header row — no duplicate vertical padding; entity card owns rhythm. */
export const collapsibleListItemEntityCardHeaderRowClasses =
  'flex w-full min-w-0 items-center gap-2'

export type CollapsibleListItemRowLayout = 'default' | 'entity-card'

/** Catalog row chrome — picker/sheet row surface tone. */
export const collapsibleListItemCatalogChromeClasses = 'border-border bg-catalog-picker-row-surface'

/**
 * Expanded catalog panel wash — bleeds to shell edges; inner details restore copy
 * alignment with the header.
 */
export const collapsibleListItemCatalogBodyClasses = cn(
  'border-t border-border-subtle bg-surface-muted -ml-2 -mr-3 pb-3 pt-0',
  establishSurfaceCurrent('surface-muted'),
)

export function collapsibleListItemHeaderRowClassesForRowLayout(
  rowLayout: CollapsibleListItemRowLayout = 'default',
): string {
  return rowLayout === 'entity-card'
    ? collapsibleListItemEntityCardHeaderRowClasses
    : collapsibleListItemHeaderRowClasses
}

/** Item shell — border and shell padding; actions rail sits inside padded box on row 1. */
export const collapsibleListItemShellVariants = cva(cn('relative rounded-md border'), {
  variants: {
    layout: {
      default: cn(
        'grid grid-cols-[minmax(0,1fr)_auto] items-start',
        collapsibleListItemShellPaddingClasses,
      ),
      headerActions: cn('flex flex-col', collapsibleListItemShellPaddingClasses),
      compactRow: cn(collapsibleListItemShellPaddingClasses, 'pt-[calc(var(--spacing)*2)]'),
      entityCardHeaderActions: cn(
        'flex flex-col',
        collapsibleListItemEntityCardShellPaddingClasses,
      ),
    },
    preset: {
      default: 'border-border',
      catalog: cn(
        collapsibleListItemCatalogChromeClasses,
        collapsibleListItemCatalogShellExtraClasses,
      ),
    },
  },
  defaultVariants: {
    layout: 'default',
    preset: 'default',
  },
})

/** Preset-aware shell classes — use when composing rows outside the shell component. */
export function collapsibleListItemShellPresetClasses(
  preset: CollapsibleListItemShellPreset = 'default',
): string {
  return collapsibleListItemShellVariants({ preset })
}

/** Default shell classes — backward-compatible alias for tests and non-context usage. */
export const collapsibleListItemShellClasses = cn(
  collapsibleListItemShellVariants(),
  'border-border',
)

/** Main content column — top inset matches shell vertical rhythm. */
export const collapsibleListItemMainClasses = 'min-w-0 pt-[calc(var(--spacing)*2)]'

/** Toolbar + actions on one row when actions center on the title row only. */
export const collapsibleListItemHeaderRowClasses = cn(
  'flex w-full min-w-0 items-center gap-2',
  'py-[calc(var(--spacing)*2)]',
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

export type CollapsibleListItemBodyClassOptions =
  Partial<CollapsibleListItemLeadingChromeOptions> & {
    preset?: CollapsibleListItemShellPreset
  }

/** Aligns detailed item bodies with the toolbar content column. */
export function collapsibleListItemBodyClasses(
  options: CollapsibleListItemBodyClassOptions = {},
): string {
  const leadingChrome: CollapsibleListItemLeadingChromeOptions = {
    showDragHandle: options.showDragHandle ?? false,
    collapsible: options.collapsible ?? false,
  }
  const resolved = resolveCollapsibleListItemLeadingChrome(leadingChrome)

  if (options.preset === 'catalog') {
    return cn(
      collapsibleListItemCatalogBodyClasses,
      resolved.contentInlineStartClasses,
      'pt-3 pr-3',
    )
  }

  return cn(resolved.contentColumnIndentClasses, 'pt-3')
}

/**
 * Stable semantic identity normalized for disclosure DOM ids.
 * Distinct from, but should normally match, the React list key.
 */
export function normalizeCollapsibleListItemDomId(itemId: string): string {
  return itemId.replace(/[^a-zA-Z0-9_-]/g, '-')
}

export function resolveCollapsibleListItemDomIds(itemId: string): {
  itemId: string
  titleId: string
  bodyId: string
} {
  const normalizedItemId = normalizeCollapsibleListItemDomId(itemId)

  return {
    itemId: normalizedItemId,
    titleId: `${normalizedItemId}-title`,
    bodyId: `${normalizedItemId}-body`,
  }
}

/** Applied to the item wrapper while it is being dragged. */
export const collapsibleListItemDraggingClasses = 'opacity-50'
