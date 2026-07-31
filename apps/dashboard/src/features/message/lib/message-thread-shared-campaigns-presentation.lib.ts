import type { ConversationSharedCampaign } from '@rpg/contracts'

export type MessageThreadSharedCampaignsPresentation = {
  visible: ConversationSharedCampaign[]
  overflow: ConversationSharedCampaign[]
  overflowCount: number
}

export function resolveMessageThreadSharedCampaignsPresentation(
  campaigns: ConversationSharedCampaign[],
): MessageThreadSharedCampaignsPresentation {
  if (campaigns.length <= 2) {
    return { visible: campaigns, overflow: [], overflowCount: 0 }
  }

  return {
    visible: campaigns.slice(0, 2),
    overflow: campaigns.slice(2),
    overflowCount: campaigns.length - 2,
  }
}

export function formatMessageThreadSharedCampaignOverflowTriggerLabel(
  overflowCount: number,
): string {
  return `+${overflowCount} more`
}

export function formatMessageThreadSharedCampaignOverflowTooltip(
  overflow: ConversationSharedCampaign[],
): string {
  return overflow.map((campaign) => campaign.campaignName).join('\n')
}
