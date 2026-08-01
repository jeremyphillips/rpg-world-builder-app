import { useQuery } from '@tanstack/react-query'
import type { CampaignInviteRouteSegment } from '@rpg/contracts'

import {
  resolveCampaignInviteById,
  resolveCampaignInviteByToken,
} from '../api/campaign-invite-client'
import type { CampaignInviteResolution } from '../lib/campaign-invite-page.lib'

export const campaignInviteResolutionQueryKey = (segment: CampaignInviteRouteSegment) =>
  ['campaign-invite', 'resolution', segment.kind, segment.value] as const

async function resolveCampaignInviteSegment(
  segment: CampaignInviteRouteSegment,
): Promise<CampaignInviteResolution> {
  return segment.kind === 'token'
    ? resolveCampaignInviteByToken(segment.value)
    : resolveCampaignInviteById(segment.value)
}

export function useCampaignInviteResolution(segment: CampaignInviteRouteSegment | null) {
  return useQuery({
    queryKey: segment
      ? campaignInviteResolutionQueryKey(segment)
      : (['campaign-invite', 'resolution', 'disabled'] as const),
    queryFn: () => resolveCampaignInviteSegment(segment!),
    enabled: Boolean(segment),
    retry: false,
  })
}
