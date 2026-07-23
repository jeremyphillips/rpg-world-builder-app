/**
 * App shell layout tokens — mobile-first (`base` = mobile, `sm+` = desktop).
 *
 * | token     | mobile | desktop |
 * | --------- | ------ | ------- |
 * | gutter    | 16px   | 24px    |
 */
export const appShellHorizontalPaddingClasses = 'px-4 sm:px-6'

/** Primary routed content column below the breadcrumb rail. */
export const appShellMainClasses = `flex-1 py-8 ${appShellHorizontalPaddingClasses}`

/** Breadcrumb rail — shares horizontal gutter with main content. */
export const appShellBreadcrumbRailClasses = `border-b border-border py-3 ${appShellHorizontalPaddingClasses}`
