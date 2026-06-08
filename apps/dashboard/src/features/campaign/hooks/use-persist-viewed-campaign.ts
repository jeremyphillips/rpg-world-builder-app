import { useEffect } from 'react'

import { writeStoredCampaignId } from '../lib/selected-campaign-storage'

/**
 * Remember the campaign currently shown in the URL so direct visits/bookmarks
 * become the user's "last selected" for the next landing redirect. Only writes
 * localStorage; the server preference is updated only on an explicit select.
 */
export function usePersistViewedCampaign(campaignId: string | undefined): void {
  useEffect(() => {
    if (campaignId) {
      writeStoredCampaignId(campaignId)
    }
  }, [campaignId])
}
