import { useContext, useLayoutEffect, type ReactNode } from 'react'

import { PageChromeActionsContext } from './page-chrome-actions-context'

/** Registers sticky header actions for the active route; cleared on unmount or dependency change. */
export function useSetPageChromeActions(actions: ReactNode) {
  const setActions = useContext(PageChromeActionsContext)?.setActions

  useLayoutEffect(() => {
    if (!setActions) return undefined

    setActions(actions)
    return () => {
      setActions(null)
    }
  }, [actions, setActions])
}
