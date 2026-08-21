import type { CampaignInviteInviteeListItem, CampaignListItem } from '@rpg/contracts'

import { readStoredCampaignId } from '@/features/campaign'
import { resolveContinueCampaign } from '@/features/campaign'
import {
  resolveCampaignRecoveryPromotions,
  type CampaignRecoveryPromotion,
} from '@/features/campaign'
import { filterPendingInvitesForMembership } from '@/features/campaign'

type CampaignPreferenceUser =
  | {
      lastSelectedCampaignId?: string | null
    }
  | null
  | undefined

export type DashboardHomeSection =
  | { kind: 'campaignRecovery'; promotion: CampaignRecoveryPromotion; recoverableCount: number }
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
    const { promotion: recoveryPromotion, recoverableCount } = resolveCampaignRecoveryPromotions(
      campaigns,
      {
        storedCampaignId: storedId,
        lastSelectedCampaignId: user?.lastSelectedCampaignId,
      },
    )
    const continueCampaign = resolveContinueCampaign(campaigns, user, storedId)

    if (recoveryPromotion) {
      sections.push({
        kind: 'campaignRecovery',
        promotion: recoveryPromotion,
        recoverableCount,
      })
    }

    const visibleInvites = filterPendingInvitesForMembership(pendingInvites, campaigns)
    if (visibleInvites.length > 0) {
      sections.push({ kind: 'pendingInvitations', invites: visibleInvites })
    }

    if (continueCampaign && continueCampaign.id !== recoveryPromotion?.campaignId) {
      sections.push({ kind: 'continueCampaign', campaign: continueCampaign })
    }
  }

  sections.push({ kind: 'starterCards' })
  return sections
}

export function resolveDashboardHomeShowAllCampaignsLink(
  sections: DashboardHomeSection[],
): boolean {
  const recovery = sections.find((section) => section.kind === 'campaignRecovery')
  return recovery?.kind === 'campaignRecovery' && recovery.recoverableCount > 1
}

/** @deprecated Use {@link DashboardHomeSection} campaignRecovery kind. */
export type { CampaignRecoveryPromotion as CampaignSetupPromotion }
