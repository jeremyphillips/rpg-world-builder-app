import type { CampaignRole } from '@rpg/contracts'

export type SearchCollectContext = {
  campaignId: string
  viewerUserId: string
  viewerRole: CampaignRole
  viewerControlledCharacterIds: readonly string[]
}
