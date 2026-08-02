'use client'

import * as React from 'react'

import { useActiveCampaignId } from '@/features/campaign'

import { GlobalSearchOverlay } from './global-search-overlay.client'
import { useGlobalSearchShortcut } from '../hooks/use-global-search-shortcut'

type GlobalSearchContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
  campaignId: string | null
}

const GlobalSearchContext = React.createContext<GlobalSearchContextValue | null>(null)

export function useGlobalSearchContext(): GlobalSearchContextValue {
  const context = React.useContext(GlobalSearchContext)
  if (!context) {
    throw new Error('useGlobalSearchContext must be used within GlobalSearchProvider')
  }

  return context
}

export type GlobalSearchProviderProps = {
  children: React.ReactNode
}

export function GlobalSearchProvider({ children }: GlobalSearchProviderProps) {
  const campaignId = useActiveCampaignId()
  const [open, setOpen] = React.useState(false)

  const handleOpen = React.useCallback(() => {
    if (!campaignId) return
    setOpen(true)
  }, [campaignId])

  useGlobalSearchShortcut({
    enabled: Boolean(campaignId),
    onOpen: handleOpen,
  })

  const value = React.useMemo(
    () => ({
      open,
      setOpen,
      campaignId,
    }),
    [campaignId, open],
  )

  return (
    <GlobalSearchContext.Provider value={value}>
      {children}
      {campaignId ? (
        <GlobalSearchOverlay campaignId={campaignId} open={open} onOpenChange={setOpen} />
      ) : null}
    </GlobalSearchContext.Provider>
  )
}
