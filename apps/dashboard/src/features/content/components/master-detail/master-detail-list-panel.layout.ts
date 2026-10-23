import { cn, panelVariants, scrollBoundaryRegionRootClasses } from '@rpg/ui'

export const masterDetailListShellClasses = cn(
  panelVariants({ tone: 'quiet', density: 'comfortable', bleed: true }),
  'sticky top-[var(--rpg-form-sticky-tabs-block-size,0px)] flex min-h-[min(8rem,var(--master-detail-shell-max-block-size))] flex-col self-start overflow-hidden text-foreground md:min-h-[min(12rem,var(--master-detail-shell-max-block-size))]',
  '[--master-detail-list-chrome-block-size:5.5rem]',
  'master-detail-list-shell-viewport-cap',
)

export const masterDetailListScrollViewportClasses =
  'min-h-0 flex-1 overflow-y-auto pe-0 scrollbar-slim'

/** @internal Layout contract tests assert on shell and scroll class strings. */
export const masterDetailListLayoutClasses = {
  shell: masterDetailListShellClasses,
  scrollRegion: scrollBoundaryRegionRootClasses,
  scrollViewport: masterDetailListScrollViewportClasses,
} as const
