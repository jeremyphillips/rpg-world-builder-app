import type { HomebrewSummaryContentType } from '@rpg/contracts'

export type CampaignSidebarContentSection = 'game-library' | 'world'

/**
 * Campaign sidebar placement for catalog types in `VISIBLE_SIDEBAR_CONTENT`.
 * New sidebar-visible types must choose a section here.
 */
export const CAMPAIGN_SIDEBAR_CONTENT_SECTION = {
  classes: 'game-library',
  spells: 'game-library',
  species: 'game-library',
  feats: 'game-library',
  equipment: 'game-library',
  'skill-proficiencies': 'game-library',
  monsters: 'game-library',
  organizations: 'world',
  locations: 'world',
} as const satisfies Record<HomebrewSummaryContentType, CampaignSidebarContentSection>

export function isGameLibrarySidebarContent(contentType: HomebrewSummaryContentType): boolean {
  return CAMPAIGN_SIDEBAR_CONTENT_SECTION[contentType] === 'game-library'
}

export function isWorldSidebarContent(contentType: HomebrewSummaryContentType): boolean {
  return CAMPAIGN_SIDEBAR_CONTENT_SECTION[contentType] === 'world'
}
