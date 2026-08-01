'use client'

import type { CampaignListItem } from '@rpg/contracts'
import { Link } from 'react-router-dom'
import { Alert, buttonVariants } from '@rpg/ui'

import { buildCampaignDisplay } from '../lib/campaign-display'
import {
  CAMPAIGN_CONNECTION_RESTORE_ACTION,
  CAMPAIGN_CONNECTION_RESTORE_BODY,
  CAMPAIGN_MEMBERSHIP_INVALID_BODY,
  CAMPAIGN_ONBOARDING_INCOMPLETE_COPY,
  campaignConnectionRestoreTitle,
  campaignMembershipInvalidTitle,
  finishJoiningCampaignTitle,
} from '../lib/campaign-onboarding-copy'
import { resolveCampaignRecoveryDestination } from '../lib/campaign-destination.lib'
import {
  isCampaignMembershipInvalid,
  isCampaignOnboardingIncomplete,
  isCampaignReconnectRequired,
  resolveCampaignRecoveryState,
} from '../lib/campaign-recovery-state'

export function CampaignOnboardingIncompleteAlert({ campaign }: { campaign: CampaignListItem }) {
  const campaignName = buildCampaignDisplay(campaign).name
  const recovery = resolveCampaignRecoveryState(campaign)
  const destination = resolveCampaignRecoveryDestination(campaign)

  if (isCampaignMembershipInvalid(recovery)) {
    return (
      <Alert
        variant="destructive"
        title={campaignMembershipInvalidTitle(campaignName)}
        description={CAMPAIGN_MEMBERSHIP_INVALID_BODY}
      />
    )
  }

  if (isCampaignReconnectRequired(recovery) && destination.href && destination.actionLabel) {
    return (
      <Alert
        variant="warning"
        title={campaignConnectionRestoreTitle(campaignName)}
        description={CAMPAIGN_CONNECTION_RESTORE_BODY}
        actions={
          <Link to={destination.href} className={buttonVariants({ size: 'sm' })}>
            {CAMPAIGN_CONNECTION_RESTORE_ACTION}
          </Link>
        }
      />
    )
  }

  if (!isCampaignOnboardingIncomplete(recovery) || !destination.href || !destination.actionLabel) {
    return null
  }

  return (
    <Alert
      variant="warning"
      title={finishJoiningCampaignTitle(campaignName)}
      description={CAMPAIGN_ONBOARDING_INCOMPLETE_COPY.message}
      actions={
        <Link to={destination.href} className={buttonVariants({ size: 'sm' })}>
          {CAMPAIGN_ONBOARDING_INCOMPLETE_COPY.action}
        </Link>
      }
    />
  )
}
