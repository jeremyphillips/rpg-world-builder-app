import * as React from 'react'

export type GlobalSearchContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
  campaignId: string | null
}

export const GlobalSearchContext = React.createContext<GlobalSearchContextValue | null>(null)

export function useGlobalSearchContext(): GlobalSearchContextValue {
  const context = React.useContext(GlobalSearchContext)
  if (!context) {
    throw new Error('useGlobalSearchContext must be used within GlobalSearchProvider')
  }

  return context
}
