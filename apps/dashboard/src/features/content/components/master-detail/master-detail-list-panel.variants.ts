import {
  cn,
  establishSurfaceCurrent,
  interactiveFocusVariants,
  interactiveRowVariants,
  scrollBoundaryRegionRootClasses,
} from '@rpg/ui'

import {
  masterDetailRailBorderClasses,
  masterDetailRailRowSeparatorClasses,
} from './master-detail-rail.variants'

/** Fixed chrome above the item list — header row plus optional availability count. */
export const masterDetailListChromeBlockSizeContractClasses =
  '[--master-detail-list-chrome-block-size:5.5rem]'

/** Bordered collection shell for the master rail. */
export const masterDetailListShellClasses = cn(
  'sticky top-[var(--rpg-form-sticky-tabs-block-size,0px)] flex min-h-[min(8rem,var(--master-detail-shell-max-block-size))] flex-col self-start overflow-hidden rounded-lg border bg-field-container text-foreground md:min-h-[min(12rem,var(--master-detail-shell-max-block-size))]',
  masterDetailRailBorderClasses,
  establishSurfaceCurrent('field-container'),
  masterDetailListChromeBlockSizeContractClasses,
  'master-detail-list-shell-viewport-cap',
)

/** Header row inside the shell — collection title and Add action. */
export const masterDetailListHeaderClasses = cn(
  'flex shrink-0 items-center justify-between gap-3 border-b px-3 py-2.5',
  masterDetailRailBorderClasses,
)

export const masterDetailListTitleClasses = 'min-w-0 text-lg font-medium text-foreground'

/** Unpadded list section — rows bleed to shell edges. */
export const masterDetailListItemsClasses = masterDetailRailRowSeparatorClasses

export function masterDetailListRowClasses(options: {
  active?: boolean
  isSelected: boolean
}): string {
  const active = options.active !== false

  return cn(
    'relative flex w-full flex-col items-start gap-0.5 border-0 py-2.5 pl-5 pr-3 text-left transition-colors',
    interactiveFocusVariants({ context: 'standalone' }),
    interactiveRowVariants({
      interaction: 'hoverable',
      state: 'default',
      hoverFamily: options.isSelected ? 'none' : 'selectable',
      selected: 'none',
      selectedHover: 'none',
    }),
    !active && 'text-muted-foreground',
    options.isSelected && 'bg-surface-muted text-foreground hover:bg-surface-muted',
    options.isSelected &&
      'before:absolute before:inset-y-1 before:left-0 before:w-0.5 before:rounded-full before:bg-primary',
  )
}

export const masterDetailListRowTitleClasses =
  'min-w-0 truncate text-sm font-medium text-foreground'

export const masterDetailListRowMetaClasses = 'min-w-0 truncate text-xs text-muted-foreground'

export const masterDetailListRowAvailabilityClasses = 'min-w-0'

export const masterDetailListEmptyClasses = 'px-3 py-4 text-sm text-muted-foreground'

/** Stable availability count row below the list header. */
export const masterDetailListCountSupplementClasses = cn(
  'flex shrink-0 flex-wrap items-center gap-x-1 border-b px-3 py-1.5 text-xs text-muted-foreground',
  masterDetailRailBorderClasses,
)

/** Scroll boundary shell for the item list — pairs with {@link masterDetailListScrollViewportClasses}. */
export const masterDetailListScrollRegionClasses = scrollBoundaryRegionRootClasses

/** Scrollable item-list viewport — no scrollbar gutter reserve. */
export const masterDetailListScrollViewportClasses =
  'min-h-0 flex-1 overflow-y-auto pe-0 scrollbar-slim'
