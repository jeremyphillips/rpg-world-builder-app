import { createContext, type ReactNode } from 'react'

export type PageChromeActionsContextValue = {
  actions: ReactNode
  setActions: (actions: ReactNode) => void
}

export const PageChromeActionsContext = createContext<PageChromeActionsContextValue | null>(null)
