import {
  cn,
  interactiveListVariants,
  panelVariants,
  scrollBoundaryRegionRootClasses,
} from '@rpg/ui'

/** Compact interactive list shell for the scrollport — flush body, no outer inset. */
export const masterDetailListBodyClasses = interactiveListVariants('compact')

export const masterDetailListChromeBorderClasses = 'ui-border--subtle'

export const masterDetailListHeaderClasses = cn(
  'master-detail-list__header',
  masterDetailListChromeBorderClasses,
)

export const masterDetailListSectionHeaderClasses = cn(
  'master-detail-list__section-header',
  masterDetailListChromeBorderClasses,
)

export const masterDetailListSupplementClasses = cn(
  'master-detail-list__supplement',
  masterDetailListChromeBorderClasses,
)

export const masterDetailListShellClasses = cn(
  panelVariants({ tone: 'quiet', density: 'comfortable', bleed: true }),
  'master-detail-list-shell sticky top-[var(--rpg-form-sticky-tabs-block-size,0px)] flex w-full min-w-0 min-h-[min(8rem,var(--master-detail-shell-max-block-size))] flex-col overflow-hidden text-foreground md:min-h-[min(12rem,var(--master-detail-shell-max-block-size))]',
  'master-detail-list-shell-viewport-cap',
)

export const masterDetailListScrollViewportClasses = cn(
  'master-detail-list__scroll min-h-0 flex-1 overflow-y-auto pe-0 scrollbar-slim',
)

export const masterDetailListScrollRegionClasses = scrollBoundaryRegionRootClasses
