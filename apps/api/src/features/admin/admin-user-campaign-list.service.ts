import type {
  AdminUserCampaignListItem,
  AdminUserCampaignListQuery,
  CampaignRole,
} from '@rpg/contracts'

import { CampaignMembershipModel, findCampaignById } from '../campaign'
import { matchesTextSearchQuery } from '../../lib/text-search.lib'

type MembershipRecord = {
  campaignId: string
  campaignRole: string
  controlledCharacterIds?: string[]
  invitedAt: Date
  joinedAt?: Date | null
}

function buildRoleFilter(role: AdminUserCampaignListQuery['role']): Record<string, unknown> {
  if (role === 'all') return {}
  return { campaignRole: role }
}

export async function listAdminUserCampaigns(
  userId: string,
  query: AdminUserCampaignListQuery,
): Promise<AdminUserCampaignListItem[]> {
  const memberships = await CampaignMembershipModel.find({
    userId,
    ...buildRoleFilter(query.role),
  })
    .select('campaignId campaignRole controlledCharacterIds invitedAt joinedAt')
    .lean<MembershipRecord[]>()

  const items: AdminUserCampaignListItem[] = []

  for (const membership of memberships) {
    const campaign = await findCampaignById(membership.campaignId)
    if (!campaign) continue

    if (!matchesTextSearchQuery(campaign.identity.name, query.q)) continue

    const joinedAt = membership.joinedAt ?? membership.invitedAt

    items.push({
      campaign: {
        id: campaign.id,
        name: campaign.identity.name,
        createdAt: campaign.createdAt,
      },
      membership: {
        role: membership.campaignRole as CampaignRole,
        joinedAt: joinedAt.toISOString(),
        controlledCharacterCount: membership.controlledCharacterIds?.length ?? 0,
      },
    })
  }

  return items.sort(
    (left, right) =>
      new Date(right.membership.joinedAt).getTime() - new Date(left.membership.joinedAt).getTime(),
  )
}
