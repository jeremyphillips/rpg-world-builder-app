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

/**
 * Breadcrumb rail — shares horizontal gutter with main content.
 * Applied by the shell rail and by the detail-page header rail.
 */
export const appShellBreadcrumbRailClasses = 'dash-app-shell__breadcrumb-rail'
