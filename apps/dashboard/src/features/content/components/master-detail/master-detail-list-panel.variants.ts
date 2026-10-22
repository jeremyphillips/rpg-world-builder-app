import {
  cardSurfaceVariants,
  cn,
  interactiveFocusVariants,
  panelVariants,
  scrollBoundaryRegionRootClasses,
} from '@rpg/ui'

import { masterDetailRailBorderClasses } from './master-detail-rail.variants'

/** Fixed chrome above the item list — header row plus optional availability count. */
export const masterDetailListChromeBlockSizeContractClasses =
  '[--master-detail-list-chrome-block-size:5.5rem]'

/** Bordered collection shell for the master rail. */
export const masterDetailListShellClasses = cn(
  panelVariants({ tone: 'quiet', density: 'comfortable', bleed: true }),
  'sticky top-[var(--rpg-form-sticky-tabs-block-size,0px)] flex min-h-[min(8rem,var(--master-detail-shell-max-block-size))] flex-col self-start overflow-hidden text-foreground md:min-h-[min(12rem,var(--master-detail-shell-max-block-size))]',
  masterDetailRailBorderClasses,
  masterDetailListChromeBlockSizeContractClasses,
  'master-detail-list-shell-viewport-cap',
)

/** Header row inside the shell — collection title and Add action. */
export const masterDetailListHeaderClasses = cn(
  'flex shrink-0 items-center justify-between gap-3 border-b px-3 py-2.5',
  masterDetailRailBorderClasses,
)

export const masterDetailListTitleClasses = 'min-w-0 text-lg font-medium text-foreground'

/** Card nav stack inside the list scrollport. */
export const masterDetailListItemsClasses = 'flex flex-col gap-2 p-2'

function masterDetailListRowCardSurface(options: { isSelected: boolean }): string {
  return cardSurfaceVariants({
    tone: 'quiet',
    elevation: 'flat',
    density: 'compact',
    interactive: true,
    selected: options.isSelected,
  })
}

export function masterDetailListRowClasses(options: { isSelected: boolean }): string {
  return cn(
    'flex w-full items-center gap-2 border-0 text-left text-foreground',
    '[padding-block:var(--ui-card-inset-block)] [padding-inline:var(--ui-card-inset-inline)]',
    masterDetailListRowCardSurface({ isSelected: options.isSelected }),
    interactiveFocusVariants({ context: 'standalone' }),
  )
}

export const masterDetailListRowContentClasses =
  'flex min-w-0 flex-1 flex-col items-start gap-0.5 text-left'

export const masterDetailListRowEyebrowClasses = 'min-w-0 truncate text-style-caption'

export const masterDetailListRowTitleClasses = 'min-w-0 truncate text-style-label text-foreground'

export const masterDetailListRowSourceClasses = 'min-w-0 truncate text-style-caption'

export const masterDetailListRowMetadataClasses = 'flex min-w-0 items-center'

export const masterDetailListRowEndClasses = 'flex shrink-0 self-center text-foreground'

/** @deprecated List rows render structured meta; detail identity still joins for subtitles. */
export const masterDetailListRowMetaClasses = 'min-w-0 truncate text-style-caption'

export const masterDetailListRowAvailabilityClasses = 'min-w-0'

export const masterDetailListEmptyClasses = 'px-3 py-4 text-style-supporting'

/** Stable availability count row below the list header. */
export function masterDetailListCountSupplementClasses(options: { hasCopy: boolean }): string {
  return cn(
    'flex shrink-0 items-center gap-2 border-b px-3 py-1.5 text-style-caption',
    masterDetailRailBorderClasses,
    options.hasCopy ? 'justify-between' : 'justify-end',
  )
}

export const masterDetailListCountSupplementCopyClasses =
  'min-w-0 flex flex-wrap items-center gap-x-1'

/** Scroll boundary shell for the item list — pairs with {@link masterDetailListScrollViewportClasses}. */
export const masterDetailListScrollRegionClasses = scrollBoundaryRegionRootClasses

/** Scrollable item-list viewport — no scrollbar gutter reserve. */
export const masterDetailListScrollViewportClasses =
  'min-h-0 flex-1 overflow-y-auto pe-0 scrollbar-slim'
