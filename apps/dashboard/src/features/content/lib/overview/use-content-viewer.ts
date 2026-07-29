import { buildContentViewerFromCampaignContext } from '@rpg/contracts'

import { useCampaigns } from '@/features/campaign'

/** Resolves the current user's `ContentViewer` for a campaign from list membership data. */
export function useContentViewer(campaignId: string | undefined) {
  const { data: campaigns } = useCampaigns()

  if (!campaignId) {
    return { kind: 'none' } as const
  }

  const campaign = campaigns?.find((entry) => entry.id === campaignId)
  if (!campaign) {
    return { kind: 'none' } as const
  }

  return buildContentViewerFromCampaignContext({
    campaignRole: campaign.campaignRole,
    pcCharacterIds: campaign.openControlledCharacterIds,
  })
}
