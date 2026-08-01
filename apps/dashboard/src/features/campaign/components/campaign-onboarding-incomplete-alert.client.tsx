'use client'

import type { CampaignListItem } from '@rpg/contracts'
import { Link } from 'react-router-dom'
import { Alert, buttonVariants } from '@rpg/ui'

import { ROUTES } from '@/app/routes'

import { buildCampaignDisplay } from '../lib/campaign-display'
import {
  CAMPAIGN_ONBOARDING_INCOMPLETE_COPY,
  CAMPAIGN_PARTICIPATION_INVALID_ACTION,
  CAMPAIGN_PARTICIPATION_INVALID_BODY,
  campaignParticipationInvalidTitle,
  finishJoiningCampaignTitle,
} from '../lib/campaign-onboarding-copy'
import {
  isCampaignOnboardingIncomplete,
  isCampaignParticipationInvalid,
  resolveCampaignRecoveryState,
} from '../lib/campaign-recovery-state'

export function CampaignOnboardingIncompleteAlert({ campaign }: { campaign: CampaignListItem }) {
  const campaignName = buildCampaignDisplay(campaign).name
  const recovery = resolveCampaignRecoveryState(campaign)

  if (isCampaignParticipationInvalid(recovery)) {
    return (
      <Alert
        variant="destructive"
        title={campaignParticipationInvalidTitle(campaignName)}
        description={CAMPAIGN_PARTICIPATION_INVALID_BODY}
        actions={
          <Link
            to={ROUTES.campaign.detail(campaign.id)}
            className={buttonVariants({ variant: 'outline', size: 'sm' })}
          >
            {CAMPAIGN_PARTICIPATION_INVALID_ACTION}
          </Link>
        }
      />
    )
  }

  if (!isCampaignOnboardingIncomplete(recovery)) {
    return null
  }

  return (
    <Alert
      variant="warning"
      title={finishJoiningCampaignTitle(campaignName)}
      description={CAMPAIGN_ONBOARDING_INCOMPLETE_COPY.message}
      actions={
        <Link
          to={ROUTES.campaign.onboarding(campaign.id)}
          className={buttonVariants({ variant: 'outline', size: 'sm' })}
        >
          {CAMPAIGN_ONBOARDING_INCOMPLETE_COPY.action}
        </Link>
      }
    />
  )
}
