import { postJson, request } from '@rpg/api-client'
import type {
  AcceptCampaignInviteResult,
  CampaignInviteAuthenticatedResolution,
  CampaignInvitePublicResolution,
} from '@rpg/contracts'
import type { QueryClient } from '@tanstack/react-query'

const RESOLVE_INVITE_ERROR = 'Could not load this invitation.'
const ACCEPT_INVITE_ERROR = 'Could not accept this invitation.'

export const campaignInvitesMineQueryKey = ['campaign-invites', 'mine'] as const
export const campaignsListQueryKey = ['campaigns', 'list'] as const

export async function invalidateCampaignInviteAcceptQueries(
  queryClient: QueryClient,
): Promise<void> {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: campaignInvitesMineQueryKey }),
    queryClient.invalidateQueries({ queryKey: campaignsListQueryKey }),
  ])
}

export async function resolveCampaignInviteByToken(
  token: string,
): Promise<CampaignInvitePublicResolution> {
  const { resolution } = await request<{ resolution: CampaignInvitePublicResolution }>(
    `/api/campaign-invites/${encodeURIComponent(token)}`,
    undefined,
    RESOLVE_INVITE_ERROR,
  )
  return resolution
}

export async function resolveCampaignInviteById(
  inviteId: string,
): Promise<CampaignInviteAuthenticatedResolution> {
  const { resolution } = await request<{ resolution: CampaignInviteAuthenticatedResolution }>(
    `/api/campaign-invites/by-id/${encodeURIComponent(inviteId)}`,
    undefined,
    RESOLVE_INVITE_ERROR,
  )
  return resolution
}

export async function acceptCampaignInviteByToken(
  token: string,
): Promise<AcceptCampaignInviteResult> {
  return postJson<AcceptCampaignInviteResult>(
    `/api/campaign-invites/${encodeURIComponent(token)}/accept`,
    {},
    ACCEPT_INVITE_ERROR,
  )
}

export async function acceptCampaignInviteById(
  inviteId: string,
): Promise<AcceptCampaignInviteResult> {
  return postJson<AcceptCampaignInviteResult>(
    `/api/campaign-invites/by-id/${encodeURIComponent(inviteId)}/accept`,
    {},
    ACCEPT_INVITE_ERROR,
  )
}
