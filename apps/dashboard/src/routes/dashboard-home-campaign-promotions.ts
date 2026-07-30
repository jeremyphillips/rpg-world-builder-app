import type { CampaignListItem } from '@rpg/contracts'

import {
  resolveContinueCampaign,
  resolveResumeSetupCampaign,
  readStoredCampaignId,
} from '@/features/campaign'

type CampaignPreferenceUser =
  | {
      lastSelectedCampaignId?: string | null
    }
  | null
  | undefined

export type DashboardHomeCampaignPromotions = {
  continueCampaign: CampaignListItem | null
  resumeSetupCampaign: CampaignListItem | null
  showAllCampaignsLink: boolean
}

export function resolveDashboardHomeCampaignPromotions(
  campaigns: CampaignListItem[] | undefined,
  campaignsError: boolean,
  user: CampaignPreferenceUser,
): DashboardHomeCampaignPromotions {
  if (campaignsError || campaigns === undefined) {
    return {
      continueCampaign: null,
      resumeSetupCampaign: null,
      showAllCampaignsLink: false,
    }
  }

  const storedId = readStoredCampaignId()
  const continueCampaign = resolveContinueCampaign(campaigns, user, storedId)
  const resumeSetupCampaign = continueCampaign
    ? null
    : resolveResumeSetupCampaign(campaigns, user, storedId)

  return {
    continueCampaign,
    resumeSetupCampaign,
    showAllCampaignsLink: campaigns.length > 1,
  }
}
