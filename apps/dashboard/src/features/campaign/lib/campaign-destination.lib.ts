import type { CampaignListItem } from '@rpg/contracts'
import type { MouseEvent } from 'react'

import { ROUTES } from '@/app/routes'

import { buildCampaignDisplay } from './campaign-display'
import { CAMPAIGN_ONBOARDING_INCOMPLETE_COPY } from './campaign-onboarding-copy'
import { isCampaignMembershipOnboardingIncomplete } from './campaign-membership-onboarding'

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
  const incomplete = isCampaignMembershipOnboardingIncomplete(campaign)

  if (incomplete) {
    return {
      href: ROUTES.campaign.onboarding(campaign.id),
      ariaLabel: `Continue setup for ${name}`,
      showSetupBadge: true,
      supportingCopy: CAMPAIGN_ONBOARDING_INCOMPLETE_COPY.message,
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
