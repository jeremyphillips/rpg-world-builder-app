/**
 * App shell layout tokens — mobile-first (`base` = mobile, `sm+` = desktop).
 *
 * | token     | mobile | desktop |
 * | --------- | ------ | ------- |
 * | gutter    | 16px   | 24px    |
 */
export const appShellHorizontalPaddingClasses = 'px-4 sm:px-6'

/** Sticky topbar + breadcrumb block size — subtracted by ViewportWorkspace. */
export const appStickyChromeBlockSize = 'calc(3rem + 2.5rem)'

/** Outer authenticated workspace frame — document scroll; no viewport lock. */
export const appShellRootClasses = `flex min-h-dvh bg-background [--app-sticky-chrome-block-size:${appStickyChromeBlockSize}]`

/** Content column beside the sidebar — normal flow; not a height contract. */
export const appShellContentColumnClasses = 'min-w-0 flex-1'

/**
 * Sticky dashboard chrome (topbar + breadcrumb) pinned while the document scrolls.
 * Publishes `--app-sticky-chrome-block-size` for workspace bounds and sticky rail offsets.
 */
export const appShellStickyChromeClasses = 'sticky top-0 z-20 bg-background'

/** Primary routed content column — horizontal gutter only; no overflow or height contract. */
export const appShellMainClasses = `${appShellHorizontalPaddingClasses} min-w-0 flex-1 [--rpg-content-top-inset:calc(3rem+2.5rem)]`

/** Breadcrumb rail — shares horizontal gutter with main content. */
export const appShellBreadcrumbRailClasses = `border-b border-border py-1.5 ${appShellHorizontalPaddingClasses}`
