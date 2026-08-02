'use client'

import { GlobalSearchTrigger } from './global-search-trigger.client'
import { useGlobalSearchContext } from './global-search-provider.client'

export function GlobalSearchTopbarTrigger() {
  const { campaignId, setOpen } = useGlobalSearchContext()

  return (
    <GlobalSearchTrigger
      disabled={!campaignId}
      onOpen={() => {
        setOpen(true)
      }}
    />
  )
}
