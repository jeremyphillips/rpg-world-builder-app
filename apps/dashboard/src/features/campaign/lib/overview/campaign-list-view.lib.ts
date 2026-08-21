import type { CampaignListItem } from '@rpg/contracts'

/** True when the campaigns query returned one or more list rows to show. */
export function hasCampaignRows(campaigns: readonly CampaignListItem[] | undefined): boolean {
  return Boolean(campaigns?.length)
}
