import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../../../lib/utils'
import { cardSurfaceVariants } from '../card.variants'
import { dragHandleVariants } from '../drag-handle.variants'
import { dragSurfaceVariants } from '../drag-surface.variants'
import { iconGhostControlVariants } from '../icon-ghost-control.variants'
import {
  collapsibleListItemBodyInsetClasses,
  resolveCollapsibleListItemLeadingChrome,
  type CollapsibleListItemLeadingChromeOptions,
} from './collapsible-list-item-leading-chrome.lib'

export type CollapsibleListItemShellPreset = 'default' | 'catalog'

export {
  collapsibleListItemChromeColumnClasses,
  collapsibleListItemBodyInsetClasses,
  collapsibleListItemSummaryClasses,
  resolveCollapsibleListItemLeadingChrome,
  type CollapsibleListItemLeadingChromeOptions,
  type ResolvedCollapsibleListItemLeadingChrome,
} from './collapsible-list-item-leading-chrome.lib'

/**
 * Collapsible list item chrome geometry — shell padding and action hit targets.
 *
 * Layout contract:
 * - Shell owns fixed box insets via `collapsibleListItemFlatShellPaddingClasses`.
 * - Leading inset for summary/body aligns with toolbar content via
 *   `resolveCollapsibleListItemLeadingChrome`.
 * - Array items use a two-column grid so the actions rail shares row 1 only;
 *   catalog rows use a flex header row with summary/body stacked below.
 */
export const collapsibleListItemShellInsetClasses = 'calc(var(--spacing) * 2)'

/** Flat array item shell — block padding. Inline inset stays on the block. */
export const collapsibleListItemFlatShellPaddingClasses = 'ui-collapsible-list-item--flat'

/**
 * Disclosure shell padding — inline inset only; bottom pad is owned by the body wash
 * (default array items and catalog picker rows).
 */
/** Disclosure inset is the block default (no extra class). */
export const collapsibleListItemDisclosureShellPaddingClasses = ''

/** Shared 24×24 hit target for grip, collapse caret, and remove (WCAG 2.2 AA minimum). */
export const collapsibleListItemChromeButtonClasses = iconGhostControlVariants({
  hover: 'text',
  layout: 'flex',
})

/** Catalog row shell — drop default bottom pad; expanded body owns vertical rhythm. */
export const collapsibleListItemCatalogShellExtraClasses = 'pb-0'

/** Entity-card host — structural reset; perimeter lives on EntityCardFrame. */
export const collapsibleListItemEntityCardShellClasses =
  'ui-collapsible-list-item ui-collapsible-list-item--entity-card'

/** Entity-card host header row — no duplicate vertical padding; entity card owns rhythm. */
export const collapsibleListItemEntityCardHeaderRowClasses = 'ui-collapsible-list-item__header'

export const collapsibleListItemEntityCardHeaderStackClasses = 'ui-collapsible-list-item__stack'

export const collapsibleListItemEntityCardHeaderStackSummaryGapClasses =
  'ui-collapsible-list-item__stack--with-summary'

export type CollapsibleListItemRowLayout = 'default' | 'entity-card'

/** Catalog row chrome — quiet card tone for raw picker rows (no Tailwind border/radius utilities). */
export const collapsibleListItemCatalogChromeClasses = cardSurfaceVariants({ tone: 'quiet' })

/** Divider, bleed, canvas fill, and content inset live on `ui-collapsible-list-item__body`. */
export const collapsibleListItemBodyFrameClasses = collapsibleListItemBodyInsetClasses

/** Catalog fill is `ui-collapsible-list-item--catalog` on the shell. */
export const collapsibleListItemCatalogBodyClasses = collapsibleListItemBodyInsetClasses

/** Canvas fill is the `__body` default. */
export const collapsibleListItemBackgroundBodyClasses = collapsibleListItemBodyInsetClasses

/** Default disclosure body. */
export const collapsibleListItemDefaultBodyClasses = collapsibleListItemBodyInsetClasses

export function collapsibleListItemHeaderRowClassesForRowLayout(
  rowLayout: CollapsibleListItemRowLayout = 'default',
): string {
  return rowLayout === 'entity-card'
    ? collapsibleListItemEntityCardHeaderRowClasses
    : collapsibleListItemHeaderRowClasses
}

/** Item shell — perimeter, fill, and disclosure padding live on `ui-collapsible-list-item`. */
export const collapsibleListItemShellVariants = cva('', {
  variants: {
    layout: {
      default: 'ui-collapsible-list-item--actions-rail',
      headerActions: '',
      compactRow: collapsibleListItemFlatShellPaddingClasses,
      entityCardHeaderActions: collapsibleListItemEntityCardShellClasses,
    },
    preset: {
      /** Entity-card hosts — perimeter lives on EntityCardFrame; CLI is structural only. */
      none: '',
      default: '',
      catalog: cn(
        'ui-collapsible-list-item--catalog',
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
  'ui-border--default',
)

/** Main content column — vertical rhythm owned by shell padding. */
export const collapsibleListItemMainClasses = 'min-w-0'

/** Toolbar + actions on one row when actions center on the title row only. */
export const collapsibleListItemHeaderRowClasses = 'flex w-full min-w-0 items-center gap-2'

/** Density-resolved header vertical rhythm — invariant across collapsed/expanded state. */
export const collapsibleListItemHeaderVerticalPaddingVariants = cva('', {
  variants: {
    density: {
      compact: 'py-2',
      comfortable: 'py-3',
      spacious: 'py-3',
    },
  },
  defaultVariants: {
    density: 'compact',
  },
})

export type CollapsibleListItemDensity = NonNullable<
  VariantProps<typeof collapsibleListItemHeaderVerticalPaddingVariants>['density']
>

/** Title + optional summary stack inside the header row main column. */
export const collapsibleListItemHeaderStackClasses = 'flex min-w-0 flex-col'

/** Gap between title block and summary subheadline (2px). */
export const collapsibleListItemHeaderStackSummaryGapClasses = 'gap-0.5'

/** Summary below the title — left indent matches body/content column. */
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
  options: {
    compact?: boolean
    embedded?: boolean
    centered?: boolean
  } = {},
): string {
  return cn(
    'flex shrink-0 items-center gap-1',
    options.embedded
      ? 'justify-self-end self-center'
      : options.centered
        ? 'shrink-0'
        : cn('self-start', options.compact ? 'mt-1' : 'mt-2'),
  )
}

/** Inline drag handle — first leading chrome column when sortable. */
export function collapsibleListItemDragHandleClasses(_options: { compact?: boolean } = {}): string {
  return dragHandleVariants({ visibility: 'always' })
}

/** Collapse caret in detailed item headers. */
export const collapsibleListItemCollapseButtonClasses = cn(
  collapsibleListItemChromeButtonClasses,
  'cursor-pointer',
)

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
    rowLayout?: CollapsibleListItemRowLayout
  }

/**
 * Entity-card hosts — structural pass-through only. Outer surfaces (disclosure EntityCard) own all
 * header/body inset; CLI supplies disclosure behavior and DOM structure.
 */
export const collapsibleListItemEntityCardBodyClasses = 'min-w-0'

/** Aligns detailed item bodies with the toolbar content column. */
export function collapsibleListItemBodyClasses(
  options: CollapsibleListItemBodyClassOptions = {},
): string {
  if (options.rowLayout === 'entity-card') {
    return collapsibleListItemEntityCardBodyClasses
  }

  return collapsibleListItemBodyInsetClasses
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
export const collapsibleListItemDraggingClasses = dragSurfaceVariants({ dragging: true })
