/**
 * App shell layout tokens — mobile-first (`base` = mobile, `sm+` = desktop).
 *
 * | token     | mobile | desktop |
 * | --------- | ------ | ------- |
 * | gutter    | 16px   | 24px    |
 */
export const appShellHorizontalPaddingClasses = 'px-4 sm:px-6'

/** Sticky topbar + breadcrumb block size — sticky rail offsets and layout tokens. */
export const appStickyChromeBlockSize = 'calc(3rem + 2.5rem)'

/** Outer authenticated workspace frame — document scroll; no viewport lock. */
export const appShellRootClasses = `flex min-h-dvh bg-background [--app-sticky-chrome-block-size:${appStickyChromeBlockSize}]`

/**
 * Content column beside the sidebar — grows with document-scroll routes.
 * ViewportWorkspace mounts {@link appShellContentColumnViewportLockClasses} at runtime.
 */
export const appShellContentColumnClasses = 'flex min-h-dvh min-w-0 flex-1 flex-col'

/** Applied while ViewportWorkspace is mounted — caps column at one viewport height. */
export const appShellContentColumnViewportLockClasses = 'h-dvh max-h-dvh min-h-0 overflow-hidden'

/**
 * Sticky dashboard chrome (topbar + breadcrumb) pinned while the document scrolls.
 * Publishes `--app-sticky-chrome-block-size` for sticky rail offsets.
 */
export const appShellStickyChromeClasses = 'sticky top-0 z-20 shrink-0 bg-background'

/**
 * Primary routed content column — flex participant for ViewportWorkspace fill;
 * still grows with content for ordinary document-scroll routes.
 */
export const appShellMainClasses = `${appShellHorizontalPaddingClasses} flex min-h-0 min-w-0 flex-1 flex-col [--rpg-content-top-inset:calc(3rem+2.5rem)]`

/** Applied while ViewportWorkspace is mounted — main flex-fills without content min-size. */
export const appShellMainViewportLockClasses = 'h-0 overflow-hidden'

export const APP_SHELL_CONTENT_COLUMN_ATTR = 'data-app-shell-content-column'
export const APP_SHELL_MAIN_ATTR = 'data-app-shell-main'

/** Breadcrumb rail — shares horizontal gutter with main content. */
export const appShellBreadcrumbRailClasses = `border-b border-border py-1.5 ${appShellHorizontalPaddingClasses}`
