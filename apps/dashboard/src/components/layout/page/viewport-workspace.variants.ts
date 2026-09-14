/** CSS custom property published by AppShell sticky chrome — ViewportWorkspace subtracts this. */
export const APP_STICKY_CHROME_BLOCK_SIZE_VAR = '--app-sticky-chrome-block-size'

/** Fallback when the shell variable is unavailable (topbar + breadcrumb rail). */
export const appStickyChromeBlockSizeFallback = 'calc(3rem + 2.5rem)'

/** Viewport block size subtracting sticky app chrome — SSOT for workspace cap tokens. */
export const viewportWorkspaceBlockSize = `calc(100dvh-var(${APP_STICKY_CHROME_BLOCK_SIZE_VAR},${appStickyChromeBlockSizeFallback}))`

/**
 * Bounded workspace root — explicit block size; flex column; sole clip owner.
 * `min-h-0` + matching `max-block-size` prevent content min-height from growing the box
 * past the viewport cap (block-size alone is not always a hard ceiling).
 */
export const viewportWorkspaceClasses = `flex min-h-0 min-w-0 flex-col overflow-hidden [block-size:${viewportWorkspaceBlockSize}] [max-block-size:${viewportWorkspaceBlockSize}]`

/** Direct child pane — fills workspace via flex; defers clipping to scroll owners below. */
export const viewportWorkspacePaneClasses = 'flex min-h-0 min-w-0 flex-1 flex-col'
