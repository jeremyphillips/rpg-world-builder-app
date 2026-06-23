import { describe, expect, it } from 'vitest'
import type { Campaign } from '@rpg/contracts'

import {
  buildCreateCampaignInput,
  buildUpdateCampaignInput,
  mapCampaignToSettingsValues,
} from './campaign-settings-values'

const campaign: Campaign = {
  id: 'c1',
  identity: {
    name: 'Sunless Citadel',
    description: 'A classic dungeon delve.',
    imageKey: 'banner.jpg',
  },
  configuration: {
    settings: {
      characterCreation: {
        startingLevel: 3,
        importedCharacters: { policy: 'approval_required' },
      },
    },
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

describe('mapCampaignToSettingsValues', () => {
  it('maps nested campaign fields to the flat form shape', () => {
    expect(mapCampaignToSettingsValues(campaign)).toEqual({
      name: 'Sunless Citadel',
      description: 'A classic dungeon delve.',
      banner: [],
      startingLevel: 3,
      maxCharacterLevel: 20,
      importedCharactersPolicy: 'approval_required',
      playStyle: ['dungeon_crawl'],
      mood: ['heroic'],
      magicLevel: 'standard_fantasy',
      difficulty: 'dangerous',
    })
  })

  it('falls back to server defaults when settings are absent', () => {
    const minimal: Campaign = {
      ...campaign,
      configuration: {},
    }

    expect(mapCampaignToSettingsValues(minimal)).toMatchObject({
      startingLevel: 1,
      maxCharacterLevel: 20,
      importedCharactersPolicy: 'disabled',
    })
  })
})

describe('buildCreateCampaignInput', () => {
  it('maps the flat wizard values to the create payload including flavor', () => {
    const values = mapCampaignToSettingsValues(campaign)

    expect(buildCreateCampaignInput(values, 'banner.webp')).toEqual({
      name: 'Sunless Citadel',
      description: 'A classic dungeon delve.',
      imageKey: 'banner.webp',
      settings: {
        characterCreation: {
          startingLevel: 3,
          importedCharacters: { policy: 'approval_required' },
        },
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
    const values = mapCampaignToSettingsValues(campaign)

    expect(buildCreateCampaignInput(values)).not.toHaveProperty('imageKey')
  })
})

describe('buildUpdateCampaignInput', () => {
  it('maps form values to the update payload and includes imageKey when provided', () => {
    const values = mapCampaignToSettingsValues(campaign)

    expect(buildUpdateCampaignInput(values, 'new-banner.webp')).toEqual({
      name: 'Sunless Citadel',
      description: 'A classic dungeon delve.',
      imageKey: 'new-banner.webp',
      settings: {
        characterCreation: {
          startingLevel: 3,
          importedCharacters: { policy: 'approval_required' },
        },
      },
      flavor: {
        playStyle: ['dungeon_crawl'],
        mood: ['heroic'],
        magicLevel: 'standard_fantasy',
        difficulty: 'dangerous',
      },
    })
  })

  it('omits imageKey when no new banner was uploaded', () => {
    const values = mapCampaignToSettingsValues(campaign)

    expect(buildUpdateCampaignInput(values)).not.toHaveProperty('imageKey')
  })
})
