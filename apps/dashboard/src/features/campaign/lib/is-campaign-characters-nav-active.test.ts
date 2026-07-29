import { describe, expect, it } from 'vitest'

import { ROUTES } from '@/app/routes'

import { buildCampaignCharacterNavigationContext } from './build-campaign-character-navigation-context'
import { isCampaignCharactersNavActive } from './is-campaign-characters-nav-active'

const CAMPAIGN_ID = 'camp_1'
const CHARACTER_ID = 'char_1'

describe('isCampaignCharactersNavActive', () => {
  it('highlights characters routes for detail nav targets', () => {
    const nav = buildCampaignCharacterNavigationContext({
      campaignId: CAMPAIGN_ID,
      role: 'pc',
      openControlledCharacterIds: [CHARACTER_ID],
      onboardingIncomplete: false,
    }).nav

    expect(nav.showCharactersNav).toBe(true)
    if (!nav.showCharactersNav) return

    expect(
      isCampaignCharactersNavActive(
        ROUTES.campaign.characters.detail(CAMPAIGN_ID, CHARACTER_ID),
        nav,
        CAMPAIGN_ID,
      ),
    ).toBe(true)
    expect(
      isCampaignCharactersNavActive(ROUTES.campaign.characters.list(CAMPAIGN_ID), nav, CAMPAIGN_ID),
    ).toBe(true)
  })

  it('does not highlight characters routes for onboarding nav targets', () => {
    const nav = buildCampaignCharacterNavigationContext({
      campaignId: CAMPAIGN_ID,
      role: 'pc',
      openControlledCharacterIds: [],
      onboardingIncomplete: true,
    }).nav

    expect(nav.showCharactersNav).toBe(true)
    if (!nav.showCharactersNav) return

    expect(
      isCampaignCharactersNavActive(ROUTES.campaign.onboarding(CAMPAIGN_ID), nav, CAMPAIGN_ID),
    ).toBe(true)
    expect(
      isCampaignCharactersNavActive(ROUTES.campaign.characters.list(CAMPAIGN_ID), nav, CAMPAIGN_ID),
    ).toBe(false)
  })
})
