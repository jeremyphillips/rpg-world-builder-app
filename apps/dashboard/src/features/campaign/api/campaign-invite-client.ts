import type { CampaignInviteOnboardingContext } from '@rpg/contracts'

import { request } from '@/lib/api-client'

const ONBOARDING_CONTEXT_ERROR = 'Could not load campaign onboarding.'

export async function fetchCampaignInviteOnboardingContext(
  inviteId: string,
): Promise<CampaignInviteOnboardingContext> {
  const { context } = await request<{ context: CampaignInviteOnboardingContext }>(
    `/api/campaign-invites/${encodeURIComponent(inviteId)}/onboarding-context`,
    undefined,
    ONBOARDING_CONTEXT_ERROR,
  )
  return context
}
