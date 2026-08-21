import type { CampaignRole, CampaignViewerState } from '@rpg/contracts'
import { isCampaignManager, isCampaignViewerSelfRecoverable } from '@rpg/contracts'

import { ROUTES } from '@/app/routes'

import { resolveCampaignRecoveryDestination } from '../recovery/campaign-destination.lib'

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
  | { kind: 'recovery' }
  | { kind: 'empty_controlled' }

function resolveCampaignCharacterViewerState(input: {
  role: CampaignRole
  openControlledCharacterIds: readonly string[]
  viewerState: CampaignViewerState
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

  if (isCampaignViewerSelfRecoverable(input.viewerState)) {
    return { kind: 'recovery' }
  }

  return { kind: 'empty_controlled' }
}

/** Resolve campaign character sidebar nav and list context from viewer membership. */
export function buildCampaignCharacterNavigationContext(input: {
  campaignId: string
  role: CampaignRole
  openControlledCharacterIds: readonly string[]
  viewerState: CampaignViewerState
}): CampaignCharacterNavigationContext {
  const state = resolveCampaignCharacterViewerState(input)
  const { campaignId } = input
  const recoveryDestination = resolveCampaignRecoveryDestination({
    campaignId,
    viewerState: input.viewerState,
  })

  switch (state.kind) {
    case 'hidden':
      return {
        nav: { showCharactersNav: false },
        list: {
          pageTitle: CAMPAIGN_CHARACTER_NAV_LABELS.characters,
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
        },
      }
    case 'recovery':
      return {
        nav: {
          showCharactersNav: true,
          label: CAMPAIGN_CHARACTER_NAV_LABELS.myCharacter,
          href: recoveryDestination.href ?? ROUTES.campaign.onboarding(campaignId),
          mode: 'onboarding',
          activeSection: 'onboarding',
        },
        list: {
          pageTitle: CAMPAIGN_CHARACTER_NAV_LABELS.myCharacter,
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
          emptyState: 'no_controlled_character',
        },
      }
  }
}
