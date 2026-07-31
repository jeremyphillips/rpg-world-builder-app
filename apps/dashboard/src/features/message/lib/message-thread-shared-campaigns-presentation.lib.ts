import type { ConversationSharedCampaign } from '@rpg/contracts'

import { buildCampaignDisplay, type CampaignDisplayVM } from '@/features/campaign'

export type MessageThreadSharedCampaignsPresentation = {
  visible: ConversationSharedCampaign[]
  overflow: ConversationSharedCampaign[]
  overflowCount: number
}

export function buildMessageThreadSharedCampaignDisplay(
  campaign: ConversationSharedCampaign,
): CampaignDisplayVM {
  return buildCampaignDisplay({
    id: campaign.campaignId,
    name: campaign.campaignName,
  })
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
  return overflow
    .map((campaign) => buildMessageThreadSharedCampaignDisplay(campaign).name)
    .join('\n')
}
