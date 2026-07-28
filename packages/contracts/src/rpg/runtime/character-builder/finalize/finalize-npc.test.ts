import { describe, expect, it } from 'vitest'

import { createEmptyCharacterBuilderDraft } from '../draft/draft'
import { finalizeNpcCharacterBuild } from './finalize-npc'
import { builderTestContext } from '../test-fixtures'

describe('finalizeNpcCharacterBuild', () => {
  it('returns a CreateNpcRequestInput without ownership fields', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      identity: { name: 'Test Character', alignment: 'ng' as const },
      species: { speciesId: 'srd-cc-5.2.1:dwarf' },
      class: { classId: 'srd-cc-5.2.1:fighter', level: 1 as const },
      abilities: {
        method: 'standard-array' as const,
        scores: { str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 },
      },
    }
    const input = finalizeNpcCharacterBuild(draft, builderTestContext)

    expect(input).toMatchObject({
      name: 'Test Character',
      rulesetId: 'srd-cc-5.2.1',
    })
    expect(input).not.toHaveProperty('characterType')
    expect(input).not.toHaveProperty('campaignId')
  })
})
