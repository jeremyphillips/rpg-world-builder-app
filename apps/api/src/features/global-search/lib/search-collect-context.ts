import type { CampaignRole } from '@rpg/contracts'

export type SearchCollectContext = {
  campaignId: string
  viewerRole: CampaignRole
  viewerControlledCharacterIds: readonly string[]
}
