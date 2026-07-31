import type {
  ConversationSharedCampaign,
  DirectConversationRecipientsResponse,
} from '@rpg/contracts'

export function resolveRecipientSharedCampaigns(
  data: DirectConversationRecipientsResponse | undefined,
  recipientUserId: string,
): ConversationSharedCampaign[] {
  if (!data) return []

  return data.campaigns
    .filter((campaign) => campaign.userIds.includes(recipientUserId))
    .map(({ campaignId, campaignName }) => ({ campaignId, campaignName }))
    .sort((left, right) => left.campaignName.localeCompare(right.campaignName))
}
