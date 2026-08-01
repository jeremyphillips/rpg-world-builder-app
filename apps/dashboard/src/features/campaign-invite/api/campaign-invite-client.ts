import { postJson, request } from '@rpg/api-client'
import type {
  AcceptCampaignInviteResult,
  CampaignInviteAuthenticatedResolution,
  CampaignInviteInviteeListResponse,
} from '@rpg/contracts'
import type { QueryClient } from '@tanstack/react-query'

import { campaignOnboardingContextQueryKey } from '@/features/campaign/hooks/use-campaign-onboarding-context'
import { campaignsQueryKey } from '@/features/campaign/hooks/use-campaigns'
import {
  notificationsInboxRootQueryKey,
  notificationsQueryKey,
} from '@/features/notification/lib/notification-query-keys'

const RESOLVE_INVITE_ERROR = 'Could not load this invitation.'
const ACCEPT_INVITE_ERROR = 'Could not accept this invitation.'

export const campaignInvitesMineQueryKey = ['campaign-invites', 'mine'] as const

export async function listPendingCampaignInvitesMine(): Promise<
  CampaignInviteInviteeListResponse['invites']
> {
  const { invites } = await request<CampaignInviteInviteeListResponse>(
    '/api/campaign-invites/mine',
    undefined,
    'Could not load your campaign invitations.',
  )
  return invites
}

export async function invalidateCampaignInviteAcceptQueries(
  queryClient: QueryClient,
  campaignId: string,
): Promise<void> {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: campaignInvitesMineQueryKey }),
    queryClient.invalidateQueries({ queryKey: campaignsQueryKey }),
    queryClient.invalidateQueries({ queryKey: notificationsQueryKey }),
    queryClient.invalidateQueries({ queryKey: notificationsInboxRootQueryKey }),
    queryClient.invalidateQueries({ queryKey: campaignOnboardingContextQueryKey(campaignId) }),
  ])
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

export async function acceptCampaignInviteById(
  inviteId: string,
): Promise<AcceptCampaignInviteResult> {
  return postJson<AcceptCampaignInviteResult>(
    `/api/campaign-invites/by-id/${encodeURIComponent(inviteId)}/accept`,
    {},
    ACCEPT_INVITE_ERROR,
  )
}
