'use client'

import { Link } from 'react-router-dom'
import { Alert, buttonVariants } from '@rpg/ui'

import { ROUTES } from '@/app/routes'

import { CAMPAIGN_ONBOARDING_INCOMPLETE_COPY } from '../lib/campaign-onboarding-copy'

export function CampaignOnboardingIncompleteAlert({ campaignId }: { campaignId: string }) {
  return (
    <Alert
      variant="warning"
      title={CAMPAIGN_ONBOARDING_INCOMPLETE_COPY.label}
      description={CAMPAIGN_ONBOARDING_INCOMPLETE_COPY.message}
      actions={
        <Link
          to={ROUTES.campaign.onboarding(campaignId)}
          className={buttonVariants({ variant: 'outline', size: 'sm' })}
        >
          {CAMPAIGN_ONBOARDING_INCOMPLETE_COPY.action}
        </Link>
      }
    />
  )
}
