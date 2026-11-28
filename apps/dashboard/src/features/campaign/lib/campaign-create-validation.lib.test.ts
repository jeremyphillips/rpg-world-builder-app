import { describe, expect, it } from 'vitest'

import { validateCampaignCreateValues } from './campaign-create-validation.lib'

describe('validateCampaignCreateValues', () => {
  it('rejects accumulated wizard values missing required identity fields', async () => {
    const result = await validateCampaignCreateValues({
      name: '',
      description: '',
    })
    expect(result.kind).toBe('invalid')
  })

  it('accepts minimally valid wizard payload', async () => {
    const result = await validateCampaignCreateValues({
      name: 'Sunless Citadel',
      description: 'A classic dungeon delve.',
      banner: [],
      startingLevel: 1,
      importedCharactersPolicy: 'disabled',
      playStyle: ['dungeon_crawl'],
      mood: ['heroic'],
      magicLevel: 'standard_fantasy',
      difficulty: 'dangerous',
      inviteEmails: [],
    })
    expect(result.kind).toBe('ok')
    if (result.kind === 'ok') {
      expect(result.data.name).toBe('Sunless Citadel')
    }
  })
})
