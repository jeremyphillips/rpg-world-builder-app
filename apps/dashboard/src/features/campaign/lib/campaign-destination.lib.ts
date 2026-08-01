import type { CampaignListItem } from '@rpg/contracts'
import type { MouseEvent } from 'react'

import { ROUTES } from '@/app/routes'

import { buildCampaignDisplay } from './campaign-display'
import {
  CAMPAIGN_ONBOARDING_INDEX_ROW_BODY,
  CAMPAIGN_PARTICIPATION_INVALID_INDEX_ROW_BODY,
} from './campaign-onboarding-copy'
import {
  isCampaignOnboardingIncomplete,
  isCampaignRecoveryRequired,
  resolveCampaignRecoveryState,
} from './campaign-recovery-state'

export type CampaignDestination = {
  href: string
  ariaLabel: string
  showSetupBadge: boolean
  supportingCopy: string | null
  shouldPersistSelection: boolean
}

/** @deprecated Use `CampaignDestination`. */
export type CampaignPickerRowDestination = CampaignDestination

export function resolveCampaignDestination(campaign: CampaignListItem): CampaignDestination {
  const display = buildCampaignDisplay(campaign)
  const name = display.name || display.id
  const recovery = resolveCampaignRecoveryState(campaign)

  if (isCampaignOnboardingIncomplete(recovery)) {
    return {
      href: ROUTES.campaign.onboarding(campaign.id),
      ariaLabel: `Continue setup for ${name}`,
      showSetupBadge: true,
      supportingCopy: CAMPAIGN_ONBOARDING_INDEX_ROW_BODY,
      shouldPersistSelection: true,
    }
  }

  if (isCampaignRecoveryRequired(recovery)) {
    return {
      href: ROUTES.campaign.detail(campaign.id),
      ariaLabel: `Open ${name} — character connection needs attention`,
      showSetupBadge: true,
      supportingCopy: CAMPAIGN_PARTICIPATION_INVALID_INDEX_ROW_BODY,
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

/** @deprecated Use `resolveCampaignDestination`. */
export const resolveCampaignPickerRowDestination = resolveCampaignDestination

export function resolveSwitchCampaignPath(
  pathname: string,
  fromId: string,
  toCampaign: CampaignListItem,
): string {
  const destination = resolveCampaignDestination(toCampaign)
  const prefix = `/campaigns/${fromId}`

  if (!pathname.startsWith(prefix)) {
    return destination.href
  }

  const segments = pathname.slice(prefix.length).split('/').filter(Boolean)
  const section = segments[0] ? `/${segments[0]}` : ''

  if (isCampaignRecoveryRequired(resolveCampaignRecoveryState(toCampaign)) && !section) {
    return destination.href
  }

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
