import * as React from 'react'

import { useActiveCampaignId } from '@/features/campaign'

import { useGlobalSearchShortcut } from '../hooks/use-global-search-shortcut'

import { GlobalSearchContext } from './global-search-context'

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

  return <GlobalSearchContext.Provider value={value}>{children}</GlobalSearchContext.Provider>
}
