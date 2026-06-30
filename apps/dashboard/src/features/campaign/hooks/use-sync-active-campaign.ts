import { useEffect } from 'react'
import { useParams } from 'react-router-dom'

import { useCampaigns } from '../hooks/use-campaigns'
import { readStoredCampaignId } from '../lib/navigation/selected-campaign-storage'
import { resolveLandingCampaignId } from '../lib/navigation/campaign-selection'
import { useCampaignStore } from '../store/campaign-store'

/**
 * Keeps the Zustand campaign store in sync with the URL and initialises it on
 * non-campaign routes.
 *
 * - URL has :campaignId → store mirrors it (URL is authoritative on campaign routes)
 * - URL has no :campaignId, store is still null, campaigns are loaded →
 *   initialise from localStorage or the sole campaign so the switcher never
 *   resets to "Select campaign" when the user navigates to agnostic routes.
 *
 * Mount once in AppShell. useParams reads from all matched routes in the tree,
 * so campaignId is visible here even though AppShell has no path param of its own.
 */
export function useSyncActiveCampaign(): void {
  const { campaignId } = useParams<{ campaignId?: string }>()
  const { data: campaigns } = useCampaigns()
  const activeCampaignId = useCampaignStore((s) => s.activeCampaignId)
  const setActiveCampaignId = useCampaignStore((s) => s.setActiveCampaignId)

  useEffect(() => {
    if (campaignId) {
      setActiveCampaignId(campaignId)
      return
    }

    if (!activeCampaignId && campaigns) {
      const resolved = resolveLandingCampaignId(campaigns, [
        readStoredCampaignId(),
        campaigns.length === 1 ? campaigns[0]?.id : undefined,
      ])
      if (resolved) setActiveCampaignId(resolved)
    }
  }, [campaignId, campaigns, activeCampaignId, setActiveCampaignId])
}
