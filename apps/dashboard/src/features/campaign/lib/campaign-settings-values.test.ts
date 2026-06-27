import { describe, expect, it } from 'vitest'
import type { Campaign, CreatureTypeId } from '@rpg/contracts'

import {
  buildCharacterCreationPatchInput,
  buildCreateCampaignInput,
  buildUpdateCampaignInput,
  mapCampaignToSettingsValues,
  type CampaignCreateValues,
} from './campaign-settings-values'

const campaign: Campaign = {
  id: 'c1',
  identity: {
    name: 'Sunless Citadel',
    description: 'A classic dungeon delve.',
    imageKey: 'banner.jpg',
  },
  configuration: {
    flavor: {
      playStyle: ['dungeon_crawl'],
      mood: ['heroic'],
      magicLevel: 'standard_fantasy',
      difficulty: 'dangerous',
    },
  },
  status: 'active',
  visibility: 'private',
  rulesetId: 'srd-cc-5.2.1',
  createdBy: 'u1',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

const defaultRules: CampaignCreateValues = {
  name: 'Sunless Citadel',
  description: 'A classic dungeon delve.',
  banner: [],
  startingLevel: 1,
  maxCharacterLevel: 20,
  extendedProgressionEnabled: false,
  extendedTierName: '',
  extendedMaxLevel: undefined,
  importedCharactersPolicy: 'disabled',
  allowedCharacterCreatureTypes: ['humanoid'],
  playStyle: ['dungeon_crawl'],
  mood: ['heroic'],
  magicLevel: 'standard_fantasy',
  difficulty: 'dangerous',
}

describe('mapCampaignToSettingsValues', () => {
  it('maps identity and flavor fields to the flat settings form shape', () => {
    expect(mapCampaignToSettingsValues(campaign)).toEqual({
      name: 'Sunless Citadel',
      description: 'A classic dungeon delve.',
      banner: [],
      playStyle: ['dungeon_crawl'],
      mood: ['heroic'],
      magicLevel: 'standard_fantasy',
      difficulty: 'dangerous',
    })
  })

  it('falls back when flavor is absent', () => {
    const minimal: Campaign = {
      ...campaign,
      configuration: {},
    }

    expect(mapCampaignToSettingsValues(minimal)).toEqual({
      name: 'Sunless Citadel',
      description: 'A classic dungeon delve.',
      banner: [],
      playStyle: undefined,
      mood: undefined,
      magicLevel: undefined,
      difficulty: undefined,
    })
  })
})

describe('buildCharacterCreationPatchInput', () => {
  it('maps flat rules fields to the nested patch shape', () => {
    expect(
      buildCharacterCreationPatchInput({
        startingLevel: 3,
        maxCharacterLevel: 20,
        extendedProgressionEnabled: false,
        importedCharactersPolicy: 'approval_required',
        allowedCharacterCreatureTypes: ['humanoid'],
      }),
    ).toEqual({
      startingLevel: 3,
      importedCharacters: { policy: 'approval_required' },
    })
  })

  it('includes extended progression in progression when enabled', () => {
    expect(
      buildCharacterCreationPatchInput({
        startingLevel: 1,
        maxCharacterLevel: 20,
        extendedProgressionEnabled: true,
        extendedTierName: 'Epic Destiny',
        extendedMaxLevel: 30,
        importedCharactersPolicy: 'disabled',
        allowedCharacterCreatureTypes: ['humanoid'],
      }),
    ).toEqual({
      startingLevel: 1,
      importedCharacters: { policy: 'disabled' },
      progression: {
        extendedProgression: { tierName: 'Epic Destiny', maxLevel: 30 },
      },
    })
  })

  it('includes creature type policy when not default', () => {
    expect(
      buildCharacterCreationPatchInput({
        startingLevel: 1,
        maxCharacterLevel: 20,
        extendedProgressionEnabled: false,
        importedCharactersPolicy: 'disabled',
        allowedCharacterCreatureTypes: ['humanoid', 'construct'] as CreatureTypeId[],
      }),
    ).toMatchObject({
      species: { creatureTypePolicy: { mode: 'only', ids: ['humanoid', 'construct'] } },
    })
  })

  it('omits creature type policy when default', () => {
    expect(
      buildCharacterCreationPatchInput({
        startingLevel: 1,
        maxCharacterLevel: 20,
        extendedProgressionEnabled: false,
        importedCharactersPolicy: 'disabled',
        allowedCharacterCreatureTypes: ['humanoid'],
      }),
    ).not.toHaveProperty('species')
  })
})

describe('buildCreateCampaignInput', () => {
  it('maps the flat wizard values to the create payload including characterCreation and flavor', () => {
    const values: CampaignCreateValues = {
      ...defaultRules,
      startingLevel: 3,
      importedCharactersPolicy: 'approval_required',
    }

    expect(buildCreateCampaignInput(values, 'banner.webp')).toEqual({
      name: 'Sunless Citadel',
      description: 'A classic dungeon delve.',
      imageKey: 'banner.webp',
      characterCreation: {
        startingLevel: 3,
        importedCharacters: { policy: 'approval_required' },
      },
      flavor: {
        playStyle: ['dungeon_crawl'],
        mood: ['heroic'],
        magicLevel: 'standard_fantasy',
        difficulty: 'dangerous',
      },
    })
  })

  it('omits imageKey when no banner was uploaded', () => {
    expect(buildCreateCampaignInput(defaultRules)).not.toHaveProperty('imageKey')
  })

  it('includes extended progression in characterCreation when enabled', () => {
    const values: CampaignCreateValues = {
      ...defaultRules,
      extendedProgressionEnabled: true,
      extendedTierName: 'Epic Destiny',
      extendedMaxLevel: 30,
    }

    expect(buildCreateCampaignInput(values).characterCreation?.progression).toEqual({
      extendedProgression: { tierName: 'Epic Destiny', maxLevel: 30 },
    })
  })
})

describe('buildUpdateCampaignInput', () => {
  it('maps settings form values to identity and flavor only', () => {
    expect(buildUpdateCampaignInput(mapCampaignToSettingsValues(campaign), 'new-banner.webp')).toEqual({
      name: 'Sunless Citadel',
      description: 'A classic dungeon delve.',
      imageKey: 'new-banner.webp',
      flavor: {
        playStyle: ['dungeon_crawl'],
        mood: ['heroic'],
        magicLevel: 'standard_fantasy',
        difficulty: 'dangerous',
      },
    })
  })

  it('omits imageKey when no new banner was uploaded', () => {
    expect(buildUpdateCampaignInput(mapCampaignToSettingsValues(campaign))).not.toHaveProperty('imageKey')
  })
})
