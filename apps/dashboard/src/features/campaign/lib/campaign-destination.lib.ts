import type { CampaignListItem } from '@rpg/contracts'
import type { MouseEvent } from 'react'

import { ROUTES } from '@/app/routes'

import { buildCampaignDisplay } from './campaign-display'
import {
  CAMPAIGN_CONNECTION_RESTORE_ACTION,
  CAMPAIGN_CONNECTION_RESTORE_INDEX_ROW_BODY,
  CAMPAIGN_MEMBERSHIP_INVALID_INDEX_ROW_BODY,
  CAMPAIGN_ONBOARDING_INDEX_ROW_BODY,
  CAMPAIGN_ONBOARDING_INCOMPLETE_BADGE,
  CAMPAIGN_CONNECTION_RESTORE_BADGE,
  CAMPAIGN_MEMBERSHIP_INVALID_BADGE,
  FINISH_JOINING_CAMPAIGN_ACTION,
} from './campaign-onboarding-copy'
import {
  isCampaignMembershipInvalid,
  isCampaignOnboardingIncomplete,
  isCampaignReconnectRequired,
  isCampaignRecoveryRequired,
  isCampaignSelfRecoverable,
  resolveCampaignRecoveryState,
  resolveRecoveryCharacterId,
} from './campaign-recovery-state'

export type CampaignDestination = {
  href: string
  ariaLabel: string
  showSetupBadge: boolean
  supportingCopy: string | null
  shouldPersistSelection: boolean
}

export type CampaignRecoveryDestination = {
  href: string | null
  actionLabel: string | null
}

/** @deprecated Use `CampaignDestination`. */
export type CampaignPickerRowDestination = CampaignDestination

export function resolveCampaignEntryDestination(campaign: CampaignListItem): CampaignDestination {
  const display = buildCampaignDisplay(campaign)
  const name = display.name || display.id
  const recovery = resolveCampaignRecoveryState(campaign)

  if (isCampaignOnboardingIncomplete(recovery)) {
    return {
      href: ROUTES.campaign.detail(campaign.id),
      ariaLabel: `Open ${name} — setup incomplete`,
      showSetupBadge: true,
      supportingCopy: CAMPAIGN_ONBOARDING_INDEX_ROW_BODY,
      shouldPersistSelection: true,
    }
  }

  if (isCampaignReconnectRequired(recovery)) {
    return {
      href: ROUTES.campaign.detail(campaign.id),
      ariaLabel: `Open ${name} — character connection needs attention`,
      showSetupBadge: true,
      supportingCopy: CAMPAIGN_CONNECTION_RESTORE_INDEX_ROW_BODY,
      shouldPersistSelection: true,
    }
  }

  if (isCampaignMembershipInvalid(recovery)) {
    return {
      href: ROUTES.campaign.detail(campaign.id),
      ariaLabel: `Open ${name} — membership needs attention`,
      showSetupBadge: true,
      supportingCopy: CAMPAIGN_MEMBERSHIP_INVALID_INDEX_ROW_BODY,
      shouldPersistSelection: true,
    }
  }

  return {
    href: ROUTES.campaign.detail(campaign.id),
    ariaLabel: `Open ${name}`,
    showSetupBadge: false,
    supportingCopy: null,
    shouldPersistSelection: true,
  }
}

export function resolveCampaignRecoveryDestination(
  campaign: CampaignListItem,
): CampaignRecoveryDestination {
  const recovery = resolveCampaignRecoveryState(campaign)

  if (isCampaignOnboardingIncomplete(recovery)) {
    return {
      href: ROUTES.campaign.onboarding(campaign.id),
      actionLabel: FINISH_JOINING_CAMPAIGN_ACTION,
    }
  }

  if (isCampaignReconnectRequired(recovery)) {
    const characterId = resolveRecoveryCharacterId(recovery)
    return {
      href: ROUTES.campaign.onboardingReconnect(campaign.id, { characterId }),
      actionLabel: CAMPAIGN_CONNECTION_RESTORE_ACTION,
    }
  }

  if (isCampaignMembershipInvalid(recovery)) {
    return { href: null, actionLabel: null }
  }

  return { href: null, actionLabel: null }
}

/** @deprecated Use {@link resolveCampaignEntryDestination}. */
export function resolveCampaignDestination(campaign: CampaignListItem): CampaignDestination {
  return resolveCampaignEntryDestination(campaign)
}

/** @deprecated Use `resolveCampaignDestination`. */
export const resolveCampaignPickerRowDestination = resolveCampaignEntryDestination

export function resolveEntryBadgeLabel(campaign: CampaignListItem): string | null {
  const recovery = resolveCampaignRecoveryState(campaign)
  if (!isCampaignRecoveryRequired(recovery)) return null
  if (isCampaignOnboardingIncomplete(recovery)) return CAMPAIGN_ONBOARDING_INCOMPLETE_BADGE
  if (isCampaignReconnectRequired(recovery)) return CAMPAIGN_CONNECTION_RESTORE_BADGE
  if (isCampaignMembershipInvalid(recovery)) return CAMPAIGN_MEMBERSHIP_INVALID_BADGE
  return null
}

export function resolveEntryBadgeTone(
  campaign: CampaignListItem,
): 'warning' | 'destructive' | null {
  const recovery = resolveCampaignRecoveryState(campaign)
  if (!isCampaignRecoveryRequired(recovery)) return null
  if (isCampaignMembershipInvalid(recovery)) return 'destructive'
  return 'warning'
}

export function resolveSwitchCampaignPath(
  pathname: string,
  fromId: string,
  toCampaign: CampaignListItem,
): string {
  const destination = resolveCampaignEntryDestination(toCampaign)
  const prefix = `/campaigns/${fromId}`

  if (!pathname.startsWith(prefix)) {
    return destination.href
  }

  const segments = pathname.slice(prefix.length).split('/').filter(Boolean)
  const section = segments[0] ? `/${segments[0]}` : ''

  if (!section) {
    return destination.href
  }

  return `/campaigns/${toCampaign.id}${section}`
}

/** Runs preference persistence only on unmodified primary link activation. */
export function shouldRunCampaignSelectionSideEffect(
  event: Pick<
    MouseEvent,
    'button' | 'defaultPrevented' | 'metaKey' | 'ctrlKey' | 'shiftKey' | 'altKey'
  >,
): boolean {
  return (
    event.button === 0 &&
    !event.defaultPrevented &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  )
}

export function listRecoverableCampaignsForHome(
  campaigns: readonly CampaignListItem[],
): CampaignListItem[] {
  return campaigns.filter((campaign) =>
    isCampaignSelfRecoverable(resolveCampaignRecoveryState(campaign)),
  )
}
