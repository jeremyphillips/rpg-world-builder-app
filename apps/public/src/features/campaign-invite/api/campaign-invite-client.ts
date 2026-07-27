import { postJson, request } from '@rpg/api-client'
import type { CampaignInvitePublicResolution } from '@rpg/contracts'

const RESOLVE_INVITE_ERROR = 'Could not load this invitation.'
const ACCEPT_INVITE_ERROR = 'Could not accept this invitation.'

type AcceptCampaignInviteResult = {
  inviteId: string
  campaignId: string
}

export async function resolveCampaignInvite(
  token: string,
): Promise<CampaignInvitePublicResolution> {
  const { resolution } = await request<{ resolution: CampaignInvitePublicResolution }>(
    `/api/campaign-invites/${encodeURIComponent(token)}`,
    undefined,
    RESOLVE_INVITE_ERROR,
  )
  return resolution
}

export async function acceptCampaignInvite(token: string): Promise<AcceptCampaignInviteResult> {
  return postJson<AcceptCampaignInviteResult>(
    `/api/campaign-invites/${encodeURIComponent(token)}/accept`,
    {},
    ACCEPT_INVITE_ERROR,
  )
}
