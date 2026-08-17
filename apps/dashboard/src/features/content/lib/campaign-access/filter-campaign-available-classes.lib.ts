import {
  DEFAULT_CONTENT_CAMPAIGN_ACCESS,
  type CharacterClass,
  type ResolvedContentCampaignAccess,
} from '@rpg/contracts'

/** Class list rows enriched with campaign access metadata from content list APIs. */
export type CampaignAccessClassRow = CharacterClass & {
  campaignAccess?: ResolvedContentCampaignAccess
}

/** True when a class row is selectable for campaign-scoped authoring (availability on). */
export function isCampaignAvailableClass(row: CampaignAccessClassRow): boolean {
  const access = row.campaignAccess ?? DEFAULT_CONTENT_CAMPAIGN_ACCESS
  return access.available !== false
}

/** Filters class list rows to those with campaign availability enabled. */
export function filterCampaignAvailableClasses<T extends CampaignAccessClassRow>(
  classes: readonly T[] | undefined,
): T[] {
  if (!classes) return []
  return classes.filter(isCampaignAvailableClass)
}
