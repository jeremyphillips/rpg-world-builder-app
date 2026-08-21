import { describe, expect, it } from 'vitest'
import type { CampaignTemplate } from '@rpg/contracts'

import { mapCampaignTemplateToCreateValues } from './campaign-template-form-values'

describe('mapCampaignTemplateToCreateValues', () => {
  it('flattens only defaults exposed by the creation wizard', () => {
    const template: CampaignTemplate = {
      metadata: {
        id: 'heroic',
        slug: 'heroic',
        version: '2.1.0',
        name: 'Heroic',
      },
      rulesetId: 'srd-cc-5.2.1',
      defaults: {
        identity: { description: '<p>A bright frontier.</p>' },
        configuration: {
          flavor: { playStyle: ['exploration'], mood: ['heroic'], difficulty: 'dangerous' },
        },
        characterCreation: {
          startingLevel: 3,
          importedCharacters: { policy: 'approval_required' },
          progression: { maxCharacterLevel: 15 },
        },
      },
      worldSeedPackIds: [],
    }

    expect(mapCampaignTemplateToCreateValues(template)).toEqual({
      description: '<p>A bright frontier.</p>',
      startingLevel: 3,
      importedCharactersPolicy: 'approval_required',
      playStyle: ['exploration'],
      mood: ['heroic'],
      difficulty: 'dangerous',
    })
  })
})
