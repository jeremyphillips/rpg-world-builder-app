import { ROUTES } from '@/app/routes'

import type { CampaignCharacterNavModel } from './build-campaign-character-navigation-context'

/** Whether the campaign characters sidebar item should appear active for `pathname`. */
export function isCampaignCharactersNavActive(
  pathname: string,
  nav: Extract<CampaignCharacterNavModel, { showCharactersNav: true }>,
  campaignId: string,
): boolean {
  if (nav.activeSection === 'onboarding') {
    return pathname.startsWith(ROUTES.campaign.onboarding(campaignId))
  }

  const charactersPrefix = ROUTES.campaign.characters.list(campaignId)
  return pathname === charactersPrefix || pathname.startsWith(`${charactersPrefix}/`)
}
