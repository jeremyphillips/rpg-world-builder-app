import { useQuery } from '@tanstack/react-query'

import { fetchCampaignInviteOnboardingContext } from '../api/campaign-invite-client'

export const campaignInviteOnboardingContextQueryKey = (inviteId: string) =>
  ['campaign-invite', 'onboarding-context', inviteId] as const

export function useCampaignInviteOnboardingContext(inviteId: string | undefined) {
  return useQuery({
    queryKey: campaignInviteOnboardingContextQueryKey(inviteId ?? ''),
    queryFn: () => fetchCampaignInviteOnboardingContext(inviteId!),
    enabled: Boolean(inviteId),
    retry: false,
  })
}
