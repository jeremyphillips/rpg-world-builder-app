import { useQuery } from '@tanstack/react-query'

import { fetchCampaignOnboardingContext } from '../api/campaign-onboarding-client'

export const campaignOnboardingContextQueryKey = (campaignId: string) =>
  ['campaigns', campaignId, 'onboarding-context'] as const

export function useCampaignOnboardingContext(campaignId: string | undefined) {
  return useQuery({
    queryKey: campaignOnboardingContextQueryKey(campaignId ?? ''),
    queryFn: () => fetchCampaignOnboardingContext(campaignId!),
    enabled: Boolean(campaignId),
    retry: false,
  })
}
