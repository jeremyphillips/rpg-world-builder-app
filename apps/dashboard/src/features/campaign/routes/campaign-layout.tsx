'use client'

import { Outlet, useMatch, useParams } from 'react-router-dom'

import { useCampaigns } from '../hooks/use-campaigns'
import { isCampaignMembershipOnboardingIncomplete } from '../lib/campaign-membership-onboarding'
import { CampaignOnboardingIncompleteAlert } from '../components/campaign-onboarding-incomplete-alert.client'

export function CampaignLayout() {
  const { campaignId } = useParams<{ campaignId: string }>()
  const { data: campaigns } = useCampaigns()
  const isOnboardingRoute = useMatch({ path: 'onboarding', end: false }) !== null

  const campaign = campaigns?.find((item) => item.id === campaignId)
  const showOnboardingAlert =
    Boolean(campaignId && campaign) &&
    !isOnboardingRoute &&
    isCampaignMembershipOnboardingIncomplete(campaign!)

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      {showOnboardingAlert ? <CampaignOnboardingIncompleteAlert campaignId={campaignId!} /> : null}
      <Outlet />
    </div>
  )
}
