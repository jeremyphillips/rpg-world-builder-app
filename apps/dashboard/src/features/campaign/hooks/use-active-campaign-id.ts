import { useParams } from 'react-router-dom'

import { resolveActiveCampaignId } from '../lib/navigation/resolve-active-campaign-id'
import { useCampaignStore } from '../store/campaign-store'

/** Resolved campaign id for switcher display and sidebar links. */
export function useActiveCampaignId(): string | null {
  const { campaignId: routeCampaignId } = useParams<{ campaignId?: string }>()
  const preferredCampaignId = useCampaignStore((state) => state.preferredCampaignId)

  return resolveActiveCampaignId({ routeCampaignId, preferredCampaignId })
}
