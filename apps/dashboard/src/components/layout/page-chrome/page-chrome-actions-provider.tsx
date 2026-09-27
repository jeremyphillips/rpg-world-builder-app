import { useMemo, useState, type ReactNode } from 'react'

import { PageChromeActionsContext } from './page-chrome-actions-context'

export function PageChromeActionsProvider({ children }: { children: ReactNode }) {
  const [actions, setActions] = useState<ReactNode>(null)
  const value = useMemo(() => ({ actions, setActions }), [actions])

  return (
    <PageChromeActionsContext.Provider value={value}>{children}</PageChromeActionsContext.Provider>
  )
}
