'use client'

import type { CampaignListItem } from '@rpg/contracts'
import { Alert, buttonVariants } from '@rpg/ui'
import { Link } from 'react-router-dom'

import { ROUTES } from '@/app/routes'

import {
  FINISH_JOINING_CAMPAIGN_ACTION,
  FINISH_JOINING_CAMPAIGN_BODY,
  finishJoiningCampaignTitle,
} from '../lib/campaign-invitation-copy'
import { buildCampaignDisplay } from '../lib/campaign-display'

type FinishJoiningCampaignCardProps = {
  campaign: CampaignListItem
}

export function FinishJoiningCampaignCard({ campaign }: FinishJoiningCampaignCardProps) {
  const campaignName = buildCampaignDisplay(campaign).name

  return (
    <Alert
      variant="warning"
      title={finishJoiningCampaignTitle(campaignName)}
      description={FINISH_JOINING_CAMPAIGN_BODY}
      actions={
        <Link
          to={ROUTES.campaign.onboarding(campaign.id)}
          className={buttonVariants({ variant: 'outline', size: 'sm' })}
        >
          {FINISH_JOINING_CAMPAIGN_ACTION}
        </Link>
      }
    />
  )
}
