import { useLayoutEffect } from 'react'

import {
  APP_SHELL_CONTENT_COLUMN_ATTR,
  APP_SHELL_MAIN_ATTR,
  appShellContentColumnViewportLockClasses,
  appShellMainViewportLockClasses,
} from '../shell/app-shell.variants'

/** Locks app-shell column + main to one viewport while ViewportWorkspace is mounted. */
export function useViewportWorkspaceShellLock() {
  useLayoutEffect(() => {
    const column = document.querySelector(`[${APP_SHELL_CONTENT_COLUMN_ATTR}]`)
    const main = document.querySelector(`[${APP_SHELL_MAIN_ATTR}]`)
    const columnClasses = appShellContentColumnViewportLockClasses.split(/\s+/).filter(Boolean)
    const mainClasses = appShellMainViewportLockClasses.split(/\s+/).filter(Boolean)

    column?.classList.add(...columnClasses)
    main?.classList.add(...mainClasses)

    return () => {
      column?.classList.remove(...columnClasses)
      main?.classList.remove(...mainClasses)
    }
  }, [])
}
