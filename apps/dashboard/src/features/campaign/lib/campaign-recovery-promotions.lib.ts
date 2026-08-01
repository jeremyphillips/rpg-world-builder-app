import type { CampaignInviteInviteeListItem, CampaignListItem } from '@rpg/contracts'
import { dashboardCampaignInviteReviewPath, resolveCampaignInviteExpiryLabel } from '@rpg/contracts'

import { ROUTES } from '@/app/routes'

import { buildCampaignDisplay } from './campaign-display'
import {
  CAMPAIGN_INVITATION_COPY,
  CAMPAIGN_PARTICIPATION_INVALID_ACTION,
  CAMPAIGN_PARTICIPATION_INVALID_BODY,
  campaignParticipationInvalidTitle,
  FINISH_JOINING_CAMPAIGN_ACTION,
  FINISH_JOINING_CAMPAIGN_BODY,
  finishJoiningCampaignTitle,
} from './campaign-onboarding-copy'
import {
  isCampaignOnboardingIncomplete,
  isCampaignRecoveryRequired,
  resolveCampaignRecoveryState,
} from './campaign-recovery-state'
import { resolvePreferredCampaignId } from './navigation/resolve-preferred-campaign-id'

export type CampaignRecoveryPromotionKind =
  | 'finish_joining'
  | 'participation_invalid'
  | 'pending_invite'

export type CampaignRecoveryPromotion = {
  kind: CampaignRecoveryPromotionKind
  campaignId: string
  title: string
  body: string
  meta?: string
  href: string
  actionLabel: string
  tone: 'default' | 'warning' | 'destructive'
}

type CampaignRecoveryPreferences = {
  storedCampaignId: string | null
  lastSelectedCampaignId?: string | null
}

export function listRecoverableCampaigns(
  campaigns: readonly CampaignListItem[],
): CampaignListItem[] {
  return campaigns.filter((campaign) =>
    isCampaignRecoveryRequired(resolveCampaignRecoveryState(campaign)),
  )
}

export function resolvePromotedRecoveryCampaign(
  campaigns: readonly CampaignListItem[],
  preferences: CampaignRecoveryPreferences,
): CampaignListItem | null {
  const recoverable = listRecoverableCampaigns(campaigns)
  if (recoverable.length === 0) return null

  const recoverableIds = new Set(recoverable.map((campaign) => campaign.id))
  const preferredId = resolvePreferredCampaignId(
    campaigns,
    preferences,
    preferences.storedCampaignId,
  )

  if (preferredId && recoverableIds.has(preferredId)) {
    return campaigns.find((campaign) => campaign.id === preferredId) ?? recoverable[0] ?? null
  }

  return recoverable[0] ?? null
}

export function toRecoveryPromotion(campaign: CampaignListItem): CampaignRecoveryPromotion {
  const campaignName = buildCampaignDisplay(campaign).name
  const recovery = resolveCampaignRecoveryState(campaign)

  if (isCampaignOnboardingIncomplete(recovery)) {
    return {
      kind: 'finish_joining',
      campaignId: campaign.id,
      title: finishJoiningCampaignTitle(campaignName),
      body: FINISH_JOINING_CAMPAIGN_BODY,
      href: ROUTES.campaign.onboarding(campaign.id),
      actionLabel: FINISH_JOINING_CAMPAIGN_ACTION,
      tone: 'warning',
    }
  }

  return {
    kind: 'participation_invalid',
    campaignId: campaign.id,
    title: campaignParticipationInvalidTitle(campaignName),
    body: CAMPAIGN_PARTICIPATION_INVALID_BODY,
    href: ROUTES.campaign.detail(campaign.id),
    actionLabel: CAMPAIGN_PARTICIPATION_INVALID_ACTION,
    tone: 'destructive',
  }
}

export function toPendingInvitePromotion(
  invite: CampaignInviteInviteeListItem,
): CampaignRecoveryPromotion {
  return {
    kind: 'pending_invite',
    campaignId: invite.campaignId,
    title: CAMPAIGN_INVITATION_COPY.cardTitle,
    body: `${invite.campaignName}. ${CAMPAIGN_INVITATION_COPY.body(invite.inviterDisplayName)}`,
    meta: resolveCampaignInviteExpiryLabel(invite.expiresAt),
    href: dashboardCampaignInviteReviewPath(invite.inviteId),
    actionLabel: CAMPAIGN_INVITATION_COPY.action,
    tone: 'default',
  }
}

export function resolveCampaignRecoveryPromotions(
  campaigns: readonly CampaignListItem[],
  preferences: CampaignRecoveryPreferences,
): { promotion: CampaignRecoveryPromotion | null; recoverableCount: number } {
  const recoverable = listRecoverableCampaigns(campaigns)
  const promotedCampaign = resolvePromotedRecoveryCampaign(campaigns, preferences)

  return {
    promotion: promotedCampaign ? toRecoveryPromotion(promotedCampaign) : null,
    recoverableCount: recoverable.length,
  }
}

/** @deprecated Use {@link CampaignRecoveryPromotion}. */
export type CampaignSetupPromotion = CampaignRecoveryPromotion

/** @deprecated Use {@link toRecoveryPromotion}. */
export const toFinishJoiningPromotion = toRecoveryPromotion

/** @deprecated Use {@link resolveCampaignRecoveryPromotions}. */
export function resolvePromotedFinishJoining(
  campaigns: readonly CampaignListItem[],
  user: CampaignRecoveryPreferences | null | undefined,
  storedId: string | null,
): { promotion: CampaignRecoveryPromotion | null; incompleteCount: number } {
  const { promotion, recoverableCount } = resolveCampaignRecoveryPromotions(campaigns, {
    storedCampaignId: storedId,
    lastSelectedCampaignId: user?.lastSelectedCampaignId,
  })
  return { promotion, incompleteCount: recoverableCount }
}

/** @deprecated Use {@link listRecoverableCampaigns}. */
export function countIncompleteCampaigns(campaigns: readonly CampaignListItem[]): number {
  return listRecoverableCampaigns(campaigns).length
}
