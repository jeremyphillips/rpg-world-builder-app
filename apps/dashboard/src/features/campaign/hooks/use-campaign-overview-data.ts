import { useCampaignInvites } from '../hooks/use-campaign-invites'
import { useCampaignMembers } from '../hooks/use-campaign-members'
import { useCampaignParty } from '../hooks/use-campaign-party'
import { resolveOverviewQueryState } from '../lib/overview/campaign-overview-query-state'

export function useCampaignOverviewData(campaignId: string | undefined, canManage: boolean) {
  const membersQuery = useCampaignMembers(campaignId)
  const partyQuery = useCampaignParty(campaignId)
  const invitesQuery = useCampaignInvites(canManage ? campaignId : undefined)
  const queryState = resolveOverviewQueryState(membersQuery, partyQuery, invitesQuery, canManage)

  return {
    members: membersQuery.data ?? [],
    party: partyQuery.data ?? [],
    invites: invitesQuery.data ?? [],
    ...queryState,
  }
}
