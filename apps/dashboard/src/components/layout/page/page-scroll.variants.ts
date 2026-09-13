/** Route scrollport — the one page vertical scroll owner. */
export const pageScrollShellClasses = 'flex min-h-0 flex-1 flex-col overflow-y-auto'

/** Inner fill wrapper inside PageScrollShell — footer floor contract, not the scrollport. */
export const pageScrollFillWrapperClasses = 'flex min-h-full flex-col'

/** Route scroll boundary — bounded frame; panes may own deliberate scrollports. */
export const viewportShellClasses = 'flex min-h-0 flex-1 flex-col overflow-hidden'

/**
 * Fill participant beneath ViewportShell — restores definite height for docked footers
 * and bounded panes. Apply to the fill wrapper and/or width shell inside a viewport route.
 */
export const viewportFillClasses = 'flex min-h-0 flex-1 flex-col'

/** Marks the route page scrollport for scroll spy and anchor navigation. */
export const PAGE_SCROLL_CONTAINER_ATTR = 'data-scroll-container'
export const PAGE_SCROLL_CONTAINER_VALUE = 'page'
export const pageScrollContainerSelector = `[${PAGE_SCROLL_CONTAINER_ATTR}="${PAGE_SCROLL_CONTAINER_VALUE}"]`

/**
 * End-of-scroll clearance for sticky page-scroll form footers — matches the docked
 * actions bar contract (69px). Applied via scroll-padding on the scrollport, not content padding.
 */
export const pageScrollStickyFooterClearanceClasses = 'scroll-pb-[69px]'
