/** CSS custom property published by AppShell sticky chrome — sticky rail offsets. */
export const APP_STICKY_CHROME_BLOCK_SIZE_VAR = '--app-sticky-chrome-block-size'

/** Fallback when the shell variable is unavailable (topbar + breadcrumb rail). */
export const appStickyChromeBlockSizeFallback = 'calc(3rem + 2.5rem)'

/**
 * Bounded workspace root — fills remaining main column height via flex; sole clip owner.
 * AppShell publishes the flex column contract; do not size with viewport units here.
 */
export const viewportWorkspaceClasses = 'flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden'

/** Direct child pane — fills workspace via flex; defers clipping to scroll owners below. */
export const viewportWorkspacePaneClasses = 'flex min-h-0 min-w-0 flex-1 flex-col'
