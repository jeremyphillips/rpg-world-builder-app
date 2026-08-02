import type { GlobalSearchDocument } from '@rpg/contracts'

export function isGlobalSearchCampaignUnavailable(document: GlobalSearchDocument): boolean {
  return document.campaignAvailable === false
}
