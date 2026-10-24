/**
 * App shell layout tokens — mobile-first (`base` = mobile, `sm+` = desktop).
 *
 * | token     | mobile | desktop |
 * | --------- | ------ | ------- |
 * | gutter    | 16px   | 24px    |
 */
export const appShellHorizontalPaddingClasses = 'px-4 sm:px-6'

/**
 * Fallback inside Tailwind `var(--app-sticky-chrome-block-size, …)` when the
 * custom property is unset (no spaces — valid in arbitrary properties).
 */
export const appStickyChromeBlockSizeVarFallback = 'calc(3rem+2rem)'

/** Named px fallback when `--app-sticky-chrome-block-size` is unavailable (document scroll spy). */
export const appStickyChromeBlockSizeFallbackPx = 80

/** Outer authenticated workspace frame — document scroll; no viewport lock. */
export const appShellRootClasses = 'dash-app-shell'

/** Content column beside the sidebar. */
export const appShellContentColumnClasses = 'dash-app-shell__column'

/** Sticky dashboard chrome (topbar + breadcrumb). */
export const appShellStickyChromeClasses = 'dash-app-shell__chrome'

/** Primary routed content column. */
export const appShellMainClasses = 'dash-app-shell__main'

/** Breadcrumb rail — shares horizontal gutter with main content. */
export const appShellBreadcrumbRailClasses = 'dash-app-shell__breadcrumb-rail'
