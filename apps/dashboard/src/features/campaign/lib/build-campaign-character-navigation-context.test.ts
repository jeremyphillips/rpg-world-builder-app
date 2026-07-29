import { describe, expect, it } from 'vitest'

import { ROUTES } from '@/app/routes'

import {
  buildCampaignCharacterNavigationContext,
  CAMPAIGN_CHARACTER_NAV_LABELS,
} from './build-campaign-character-navigation-context'

const CAMPAIGN_ID = 'camp_1'
const CHARACTER_ID = 'char_1'

describe('buildCampaignCharacterNavigationContext', () => {
  it('hides nav for observers', () => {
    expect(
      buildCampaignCharacterNavigationContext({
        campaignId: CAMPAIGN_ID,
        role: 'observer',
        openControlledCharacterIds: [],
        onboardingIncomplete: false,
      }),
    ).toEqual({
      nav: { showCharactersNav: false },
      list: {
        pageTitle: CAMPAIGN_CHARACTER_NAV_LABELS.characters,
        listScope: 'controlled',
      },
    })
  })

  it('routes managers to the characters list even when they control a PC', () => {
    expect(
      buildCampaignCharacterNavigationContext({
        campaignId: CAMPAIGN_ID,
        role: 'owner',
        openControlledCharacterIds: [CHARACTER_ID],
        onboardingIncomplete: false,
      }),
    ).toEqual({
      nav: {
        showCharactersNav: true,
        label: CAMPAIGN_CHARACTER_NAV_LABELS.characters,
        href: ROUTES.campaign.characters.list(CAMPAIGN_ID),
        mode: 'list',
        activeSection: 'characters',
      },
      list: {
        pageTitle: CAMPAIGN_CHARACTER_NAV_LABELS.characters,
        listScope: 'all_participating',
        emptyState: 'no_participating_characters',
      },
    })
  })

  it('routes a PC with one open controlled character to detail', () => {
    expect(
      buildCampaignCharacterNavigationContext({
        campaignId: CAMPAIGN_ID,
        role: 'pc',
        openControlledCharacterIds: [CHARACTER_ID],
        onboardingIncomplete: false,
      }),
    ).toEqual({
      nav: {
        showCharactersNav: true,
        label: CAMPAIGN_CHARACTER_NAV_LABELS.myCharacter,
        href: ROUTES.campaign.characters.detail(CAMPAIGN_ID, CHARACTER_ID),
        mode: 'detail',
        activeSection: 'characters',
      },
      list: {
        pageTitle: CAMPAIGN_CHARACTER_NAV_LABELS.myCharacter,
        listScope: 'controlled',
      },
    })
  })

  it('routes a PC with multiple open controlled characters to the list', () => {
    expect(
      buildCampaignCharacterNavigationContext({
        campaignId: CAMPAIGN_ID,
        role: 'pc',
        openControlledCharacterIds: ['char_1', 'char_2'],
        onboardingIncomplete: false,
      }),
    ).toEqual({
      nav: {
        showCharactersNav: true,
        label: CAMPAIGN_CHARACTER_NAV_LABELS.myCharacters,
        href: ROUTES.campaign.characters.list(CAMPAIGN_ID),
        mode: 'list',
        activeSection: 'characters',
      },
      list: {
        pageTitle: CAMPAIGN_CHARACTER_NAV_LABELS.myCharacters,
        listScope: 'controlled',
      },
    })
  })

  it('prefers open control over stale onboarding metadata', () => {
    expect(
      buildCampaignCharacterNavigationContext({
        campaignId: CAMPAIGN_ID,
        role: 'pc',
        openControlledCharacterIds: [CHARACTER_ID],
        onboardingIncomplete: true,
      }).nav,
    ).toMatchObject({
      mode: 'detail',
      href: ROUTES.campaign.characters.detail(CAMPAIGN_ID, CHARACTER_ID),
    })
  })

  it('routes onboarding PCs with zero open control to onboarding', () => {
    expect(
      buildCampaignCharacterNavigationContext({
        campaignId: CAMPAIGN_ID,
        role: 'pc',
        openControlledCharacterIds: [],
        onboardingIncomplete: true,
      }),
    ).toEqual({
      nav: {
        showCharactersNav: true,
        label: CAMPAIGN_CHARACTER_NAV_LABELS.myCharacter,
        href: ROUTES.campaign.onboarding(CAMPAIGN_ID),
        mode: 'onboarding',
        activeSection: 'onboarding',
      },
      list: {
        pageTitle: CAMPAIGN_CHARACTER_NAV_LABELS.myCharacter,
        listScope: 'controlled',
      },
    })
  })

  it('routes post-onboarding PCs with zero open control to the list empty state', () => {
    expect(
      buildCampaignCharacterNavigationContext({
        campaignId: CAMPAIGN_ID,
        role: 'pc',
        openControlledCharacterIds: [],
        onboardingIncomplete: false,
      }),
    ).toEqual({
      nav: {
        showCharactersNav: true,
        label: CAMPAIGN_CHARACTER_NAV_LABELS.myCharacter,
        href: ROUTES.campaign.characters.list(CAMPAIGN_ID),
        mode: 'list',
        activeSection: 'characters',
      },
      list: {
        pageTitle: CAMPAIGN_CHARACTER_NAV_LABELS.myCharacter,
        listScope: 'controlled',
        emptyState: 'no_controlled_character',
      },
    })
  })

  it('dedupes open controlled count when projecting detail href', () => {
    const context = buildCampaignCharacterNavigationContext({
      campaignId: CAMPAIGN_ID,
      role: 'pc',
      openControlledCharacterIds: [CHARACTER_ID, CHARACTER_ID],
      onboardingIncomplete: false,
    })

    expect(context.nav).toMatchObject({
      mode: 'list',
      label: CAMPAIGN_CHARACTER_NAV_LABELS.myCharacters,
    })
  })
})
