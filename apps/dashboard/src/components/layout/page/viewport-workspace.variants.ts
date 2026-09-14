/** CSS custom property published by AppShell sticky chrome — sticky rail offsets. */
export const APP_STICKY_CHROME_BLOCK_SIZE_VAR = '--app-sticky-chrome-block-size'

/** Fallback when the shell variable is unavailable (topbar + breadcrumb rail). */
export const appStickyChromeBlockSizeFallback = 'calc(3rem + 2.5rem)'

/** Marker on ViewportWorkspace — AppShell `:has()` caps column height on edit routes. */
export const VIEWPORT_WORKSPACE_FILL_ATTR = 'data-viewport-fill'
export const VIEWPORT_WORKSPACE_FILL_VALUE = 'workspace'

/**
 * Bounded workspace root — `h-0 flex-1` takes allocated main height without content min-size.
 * {@link useViewportWorkspaceShellLock} keeps the column at viewport height on resize.
 */
export const viewportWorkspaceClasses = 'flex h-0 min-h-0 min-w-0 flex-1 flex-col overflow-hidden'

/** Direct child pane — fills workspace via flex; defers clipping to scroll owners below. */
export const viewportWorkspacePaneClasses = 'flex h-0 min-h-0 min-w-0 flex-1 flex-col'
