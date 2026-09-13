/** CSS custom property published by AppShell sticky chrome — ViewportWorkspace subtracts this. */
export const APP_STICKY_CHROME_BLOCK_SIZE_VAR = '--app-sticky-chrome-block-size'

/** Fallback when the shell variable is unavailable (topbar + breadcrumb rail). */
export const appStickyChromeBlockSizeFallback = 'calc(3rem + 2.5rem)'

/**
 * Bounded workspace root — explicit block size; flex column; sole clip owner.
 * Children must not grow the workspace block-size (`min-h-0` or internal scroll).
 */
export const viewportWorkspaceClasses = `flex min-w-0 flex-col overflow-hidden [block-size:calc(100dvh-var(${APP_STICKY_CHROME_BLOCK_SIZE_VAR},${appStickyChromeBlockSizeFallback}))]`

/** Direct child pane — fills workspace via flex; defers clipping to scroll owners below. */
export const viewportWorkspacePaneClasses = 'flex min-h-0 min-w-0 flex-1 flex-col'
