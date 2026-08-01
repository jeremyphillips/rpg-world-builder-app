import type { CampaignInviteInviteeListItem, CampaignListItem } from '@rpg/contracts'

import {
  readStoredCampaignId,
  resolveContinueCampaign,
  resolveResumeSetupCampaign,
} from '@/features/campaign'
import { filterPendingInvitesForMembership } from '@/features/campaign/lib/filter-pending-invites-for-membership'

type CampaignPreferenceUser =
  | {
      lastSelectedCampaignId?: string | null
    }
  | null
  | undefined

export type DashboardHomeSection =
  | { kind: 'finishJoining'; campaign: CampaignListItem }
  | { kind: 'pendingInvitations'; invites: CampaignInviteInviteeListItem[] }
  | { kind: 'continueCampaign'; campaign: CampaignListItem }
  | { kind: 'starterCards' }

export function resolveDashboardHomeSections({
  campaigns,
  pendingInvites,
  campaignsError,
  user,
}: {
  campaigns: CampaignListItem[] | undefined
  pendingInvites: CampaignInviteInviteeListItem[] | undefined
  campaignsError: boolean
  user: CampaignPreferenceUser
}): DashboardHomeSection[] {
  const sections: DashboardHomeSection[] = []

  if (!campaignsError && campaigns !== undefined) {
    const storedId = readStoredCampaignId()
    const continueCampaign = resolveContinueCampaign(campaigns, user, storedId)
    const finishJoiningCampaign = continueCampaign
      ? null
      : resolveResumeSetupCampaign(campaigns, user, storedId)

    if (finishJoiningCampaign) {
      sections.push({ kind: 'finishJoining', campaign: finishJoiningCampaign })
    }

    const visibleInvites = filterPendingInvitesForMembership(pendingInvites, campaigns)
    if (visibleInvites.length > 0) {
      sections.push({ kind: 'pendingInvitations', invites: visibleInvites })
    }

    if (continueCampaign && continueCampaign.id !== finishJoiningCampaign?.id) {
      sections.push({ kind: 'continueCampaign', campaign: continueCampaign })
    }
  }

  sections.push({ kind: 'starterCards' })
  return sections
}

export function resolveDashboardHomeShowAllCampaignsLink(
  campaigns: CampaignListItem[] | undefined,
  campaignsError: boolean,
): boolean {
  return !campaignsError && campaigns !== undefined && campaigns.length > 1
}
