import type { CampaignRole } from '@rpg/contracts'
import { isCampaignManager } from '@rpg/contracts'

import { ROUTES } from '@/app/routes'

export const CAMPAIGN_CHARACTER_NAV_LABELS = {
  characters: 'Characters',
  myCharacter: 'My Character',
  myCharacters: 'My Characters',
} as const

export type CampaignCharacterNavLabel =
  (typeof CAMPAIGN_CHARACTER_NAV_LABELS)[keyof typeof CAMPAIGN_CHARACTER_NAV_LABELS]

export type CampaignCharacterNavModel =
  | {
      showCharactersNav: true
      label: CampaignCharacterNavLabel
      href: string
      mode: 'detail' | 'list' | 'onboarding'
      activeSection: 'characters' | 'onboarding'
    }
  | {
      showCharactersNav: false
    }

export type CampaignCharactersListContextModel = {
  pageTitle: string
  listScope: 'controlled' | 'all_participating'
  emptyState?: 'no_controlled_character' | 'no_participating_characters'
}

export type CampaignCharacterNavigationContext = {
  nav: CampaignCharacterNavModel
  list: CampaignCharactersListContextModel
}

type ResolvedViewerState =
  | { kind: 'hidden' }
  | { kind: 'manager' }
  | { kind: 'single_controlled'; characterId: string }
  | { kind: 'multi_controlled' }
  | { kind: 'onboarding' }
  | { kind: 'empty_controlled' }

function resolveCampaignCharacterViewerState(input: {
  role: CampaignRole
  openControlledCharacterIds: readonly string[]
  onboardingIncomplete: boolean
}): ResolvedViewerState {
  if (input.role === 'observer') {
    return { kind: 'hidden' }
  }

  if (isCampaignManager(input.role)) {
    return { kind: 'manager' }
  }

  const openCount = input.openControlledCharacterIds.length
  if (openCount > 0) {
    if (openCount === 1) {
      return {
        kind: 'single_controlled',
        characterId: input.openControlledCharacterIds[0]!,
      }
    }
    return { kind: 'multi_controlled' }
  }

  if (input.onboardingIncomplete) {
    return { kind: 'onboarding' }
  }

  return { kind: 'empty_controlled' }
}

/** Resolve campaign character sidebar nav and list context from viewer membership. */
export function buildCampaignCharacterNavigationContext(input: {
  campaignId: string
  role: CampaignRole
  openControlledCharacterIds: readonly string[]
  onboardingIncomplete: boolean
}): CampaignCharacterNavigationContext {
  const state = resolveCampaignCharacterViewerState(input)
  const { campaignId } = input

  switch (state.kind) {
    case 'hidden':
      return {
        nav: { showCharactersNav: false },
        list: {
          pageTitle: CAMPAIGN_CHARACTER_NAV_LABELS.characters,
          listScope: 'controlled',
        },
      }
    case 'manager':
      return {
        nav: {
          showCharactersNav: true,
          label: CAMPAIGN_CHARACTER_NAV_LABELS.characters,
          href: ROUTES.campaign.characters.list(campaignId),
          mode: 'list',
          activeSection: 'characters',
        },
        list: {
          pageTitle: CAMPAIGN_CHARACTER_NAV_LABELS.characters,
          listScope: 'all_participating',
          emptyState: 'no_participating_characters',
        },
      }
    case 'single_controlled':
      return {
        nav: {
          showCharactersNav: true,
          label: CAMPAIGN_CHARACTER_NAV_LABELS.myCharacter,
          href: ROUTES.campaign.characters.detail(campaignId, state.characterId),
          mode: 'detail',
          activeSection: 'characters',
        },
        list: {
          pageTitle: CAMPAIGN_CHARACTER_NAV_LABELS.myCharacter,
          listScope: 'controlled',
        },
      }
    case 'multi_controlled':
      return {
        nav: {
          showCharactersNav: true,
          label: CAMPAIGN_CHARACTER_NAV_LABELS.myCharacters,
          href: ROUTES.campaign.characters.list(campaignId),
          mode: 'list',
          activeSection: 'characters',
        },
        list: {
          pageTitle: CAMPAIGN_CHARACTER_NAV_LABELS.myCharacters,
          listScope: 'controlled',
        },
      }
    case 'onboarding':
      return {
        nav: {
          showCharactersNav: true,
          label: CAMPAIGN_CHARACTER_NAV_LABELS.myCharacter,
          href: ROUTES.campaign.onboarding(campaignId),
          mode: 'onboarding',
          activeSection: 'onboarding',
        },
        list: {
          pageTitle: CAMPAIGN_CHARACTER_NAV_LABELS.myCharacter,
          listScope: 'controlled',
        },
      }
    case 'empty_controlled':
      return {
        nav: {
          showCharactersNav: true,
          label: CAMPAIGN_CHARACTER_NAV_LABELS.myCharacter,
          href: ROUTES.campaign.characters.list(campaignId),
          mode: 'list',
          activeSection: 'characters',
        },
        list: {
          pageTitle: CAMPAIGN_CHARACTER_NAV_LABELS.myCharacter,
          listScope: 'controlled',
          emptyState: 'no_controlled_character',
        },
      }
  }
}
