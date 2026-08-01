'use client'

import { Outlet, useLocation, useMatch, useParams } from 'react-router-dom'

import { CampaignLayoutRecoveryChrome } from '../components/campaign-layout-recovery-chrome.client'
import { useCampaigns } from '../hooks/use-campaigns'
import { usePersistViewedCampaign } from '../hooks/use-persist-viewed-campaign'

export function CampaignLayout() {
  const { campaignId } = useParams<{ campaignId: string }>()
  const { pathname } = useLocation()
  const { data: campaigns, isPending: campaignsPending, isError: campaignsError } = useCampaigns()
  const isOnboardingRoute = pathname.includes('/onboarding')
  const activeCampaignMatch = useMatch({ path: ':campaignId/*', end: false })
  const shouldPersistViewedCampaign =
    Boolean(campaignId) && activeCampaignMatch?.params.campaignId === campaignId

  usePersistViewedCampaign(campaignId, shouldPersistViewedCampaign)

  const campaign = campaigns?.find((item) => item.id === campaignId)

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <CampaignLayoutRecoveryChrome
        campaignId={campaignId}
        campaign={campaign}
        campaignsPending={campaignsPending}
        campaignsError={campaignsError}
        isOnboardingRoute={isOnboardingRoute}
      />
      <Outlet />
    </div>
  )
}
