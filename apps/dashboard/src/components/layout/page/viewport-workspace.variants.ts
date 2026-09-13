/** CSS custom property published by AppShell sticky chrome — ViewportWorkspace subtracts this. */
export const APP_STICKY_CHROME_BLOCK_SIZE_VAR = '--app-sticky-chrome-block-size'

/** Fallback when the shell variable is unavailable (topbar + breadcrumb rail). */
export const appStickyChromeBlockSizeFallback = 'calc(3rem + 2.5rem)'

/**
 * Bounded workspace root — explicit block size; no flex-height chain from main.
 * Panes inside establish `min-h-0` and local scroll themselves.
 */
export const viewportWorkspaceClasses = `min-w-0 overflow-hidden [block-size:calc(100dvh-var(${APP_STICKY_CHROME_BLOCK_SIZE_VAR},${appStickyChromeBlockSizeFallback}))]`

/** Direct child pane inside a viewport workspace — clips and passes height to scrollports. */
export const viewportWorkspacePaneClasses = 'flex min-h-0 min-w-0 flex-col overflow-hidden'
