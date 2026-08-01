'use client'

import type { CampaignListItem } from '@rpg/contracts'
import { Alert, Text } from '@rpg/ui'

import { CAMPAIGNS_QUERY_ERROR_MESSAGE } from '../lib/campaign-display'
import {
  isCampaignRecoveryRequired,
  resolveCampaignRecoveryState,
} from '../lib/campaign-recovery-state'
import { CampaignOnboardingIncompleteAlert } from './campaign-onboarding-incomplete-alert.client'

type CampaignLayoutRecoveryChromeProps = {
  campaignId: string | undefined
  campaign: CampaignListItem | undefined
  campaignsPending: boolean
  campaignsError: boolean
  isOnboardingRoute: boolean
}

export function CampaignLayoutRecoveryChrome({
  campaignId,
  campaign,
  campaignsPending,
  campaignsError,
  isOnboardingRoute,
}: CampaignLayoutRecoveryChromeProps) {
  if (!campaignId || isOnboardingRoute) {
    return null
  }

  if (campaignsPending && !campaign) {
    return (
      <Text variant="muted" role="status" aria-live="polite">
        Loading campaign context…
      </Text>
    )
  }

  if (campaignsError && !campaign) {
    return (
      <Alert
        variant="warning"
        title="Campaign context unavailable"
        description={CAMPAIGNS_QUERY_ERROR_MESSAGE}
      />
    )
  }

  if (!campaign) {
    return null
  }

  if (!isCampaignRecoveryRequired(resolveCampaignRecoveryState(campaign))) {
    return null
  }

  return <CampaignOnboardingIncompleteAlert campaign={campaign} />
}
