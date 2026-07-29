import { useEffect } from 'react'

import { useCampaigns } from '../hooks/use-campaigns'
import { resolveLandingCampaignId } from '../lib/navigation/campaign-selection'
import { readStoredCampaignId } from '../lib/navigation/selected-campaign-storage'
import { useCampaignStore } from '../store/campaign-store'

/**
 * Initializes `preferredCampaignId` once from localStorage or a sole campaign.
 * Route visits do not overwrite the stored preference — use `useActiveCampaignId`
 * when UI needs the effective campaign (route wins on campaign URLs).
 *
 * Mount once in AppShell.
 */
export function useSyncActiveCampaign(): void {
  const { data: campaigns } = useCampaigns()
  const preferredCampaignId = useCampaignStore((state) => state.preferredCampaignId)
  const setPreferredCampaignId = useCampaignStore((state) => state.setPreferredCampaignId)

  useEffect(() => {
    if (preferredCampaignId || !campaigns) return

    const resolved = resolveLandingCampaignId(campaigns, [
      readStoredCampaignId(),
      campaigns.length === 1 ? campaigns[0]?.id : undefined,
    ])
    if (resolved) setPreferredCampaignId(resolved)
  }, [campaigns, preferredCampaignId, setPreferredCampaignId])
}
