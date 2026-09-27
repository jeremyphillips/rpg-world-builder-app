import { describe, expect, it } from 'vitest'

import { minimalStandalonePcInput } from '../../test/fixtures/characters'
import { useIntegrationDb } from '../../test/setup/integration-db'
import { CharacterModel } from './character.model'

useIntegrationDb()

describe('character persistence', () => {
  it('keeps empty spell access and media roles after save and reload', async () => {
    const character = new CharacterModel({
      ...minimalStandalonePcInput,
      characterType: 'pc',
      userId: 'persistence-user',
      spells: [
        {
          spellId: 'srd-cc-5.2.1:fire-bolt',
          sources: [{ kind: 'manual' }],
          access: {},
        },
      ],
      media: {
        revision: 0,
        images: [],
        roles: {},
      },
    })

    await character.save()

    const reloaded = await CharacterModel.findById(character.id).lean()
    expect(reloaded?.spells?.[0]).toMatchObject({
      spellId: 'srd-cc-5.2.1:fire-bolt',
      access: {},
    })
    expect(reloaded?.media).toMatchObject({ roles: {} })
  })
})
