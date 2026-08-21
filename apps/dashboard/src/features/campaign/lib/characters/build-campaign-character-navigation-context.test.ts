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
        viewerState: { kind: 'ready' },
      }),
    ).toEqual({
      nav: { showCharactersNav: false },
      list: {
        pageTitle: CAMPAIGN_CHARACTER_NAV_LABELS.characters,
      },
    })
  })

  it('routes managers to the characters list even when they control a PC', () => {
    expect(
      buildCampaignCharacterNavigationContext({
        campaignId: CAMPAIGN_ID,
        role: 'owner',
        openControlledCharacterIds: [CHARACTER_ID],
        viewerState: { kind: 'ready' },
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
        viewerState: { kind: 'ready' },
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
      },
    })
  })

  it('routes a PC with multiple open controlled characters to the list', () => {
    expect(
      buildCampaignCharacterNavigationContext({
        campaignId: CAMPAIGN_ID,
        role: 'pc',
        openControlledCharacterIds: ['char_1', 'char_2'],
        viewerState: { kind: 'ready' },
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
      },
    })
  })

  it('prefers open control over stale onboarding metadata', () => {
    expect(
      buildCampaignCharacterNavigationContext({
        campaignId: CAMPAIGN_ID,
        role: 'pc',
        openControlledCharacterIds: [CHARACTER_ID],
        viewerState: { kind: 'onboarding_incomplete' },
      }).nav,
    ).toMatchObject({
      mode: 'detail',
      href: ROUTES.campaign.characters.detail(CAMPAIGN_ID, CHARACTER_ID),
    })
  })

  it('routes onboarding PCs with zero open control to the recovery destination', () => {
    expect(
      buildCampaignCharacterNavigationContext({
        campaignId: CAMPAIGN_ID,
        role: 'pc',
        openControlledCharacterIds: [],
        viewerState: { kind: 'onboarding_incomplete' },
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
      },
    })
  })

  it('routes reconnect PCs with zero open control to the reconnect destination', () => {
    expect(
      buildCampaignCharacterNavigationContext({
        campaignId: CAMPAIGN_ID,
        role: 'pc',
        openControlledCharacterIds: [],
        viewerState: { kind: 'control_stale', characterId: CHARACTER_ID },
      }).nav,
    ).toMatchObject({
      href: ROUTES.campaign.onboardingReconnect(CAMPAIGN_ID, { characterId: CHARACTER_ID }),
      mode: 'onboarding',
      activeSection: 'onboarding',
    })
  })

  it('routes post-onboarding PCs with zero open control to the list empty state', () => {
    expect(
      buildCampaignCharacterNavigationContext({
        campaignId: CAMPAIGN_ID,
        role: 'pc',
        openControlledCharacterIds: [],
        viewerState: { kind: 'ready' },
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
        emptyState: 'no_controlled_character',
      },
    })
  })

  it('dedupes open controlled count when projecting detail href', () => {
    const context = buildCampaignCharacterNavigationContext({
      campaignId: CAMPAIGN_ID,
      role: 'pc',
      openControlledCharacterIds: [CHARACTER_ID, CHARACTER_ID],
      viewerState: { kind: 'ready' },
    })

    expect(context.nav).toMatchObject({
      mode: 'list',
      label: CAMPAIGN_CHARACTER_NAV_LABELS.myCharacters,
    })
  })
})
