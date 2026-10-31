import {
  cn,
  interactiveListVariants,
  panelVariants,
  scrollBoundaryRegionRootClasses,
} from '@rpg/ui'

/** Compact interactive list shell for the scrollport — flush body, no outer inset. */
export const masterDetailListBodyClasses = interactiveListVariants('compact')

export const masterDetailListShellClasses = cn(
  panelVariants({ tone: 'quiet', density: 'comfortable', bleed: true }),
  'sticky top-[var(--rpg-form-sticky-tabs-block-size,0px)] flex w-full min-w-0 min-h-[min(8rem,var(--master-detail-shell-max-block-size))] flex-col overflow-hidden text-foreground md:min-h-[min(12rem,var(--master-detail-shell-max-block-size))]',
  'master-detail-list-shell-viewport-cap',
)

export const masterDetailListScrollViewportClasses =
  'min-h-0 flex-1 overflow-y-auto pe-0 scrollbar-slim'

export const masterDetailListScrollRegionClasses = scrollBoundaryRegionRootClasses
