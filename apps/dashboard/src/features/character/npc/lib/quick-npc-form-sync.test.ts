import { describe, expect, it } from 'vitest'

import {
  createCampaignNpcBuilderContextFixture,
  populatedBuilderCatalog,
} from '../../lib/character-builder-fixtures'
import {
  QUICK_NPC_REQUIRED_SPELL_FIELD_NAME,
  QUICK_NPC_REQUIRED_WEAPON_FIELD_NAME,
  type QuickNpcSetupValues,
} from './quick-npc-form-fields'
import { quickNpcMemberSetupWithNoTitle } from './quick-npc-test-fixtures'
import { createQuickNpcFormValueSyncs } from './quick-npc-form-sync'

const quickFighter = {
  ...populatedBuilderCatalog.classes[0]!,
  characterCreation: {
    proficiencies: {
      skills: {
        choices: [{ id: 'class-skills', choose: 1, from: ['athletics'] }],
      },
    },
  },
}

const buildContext = createCampaignNpcBuilderContextFixture({
  catalog: {
    ...populatedBuilderCatalog,
    classes: [quickFighter],
  },
})

describe('createQuickNpcFormValueSyncs', () => {
  it('intersects weapon requirements when setup changes make ids invalid', () => {
    const sync = createQuickNpcFormValueSyncs(buildContext)[0]!
    const setup: QuickNpcSetupValues = quickNpcMemberSetupWithNoTitle({
      speciesId: populatedBuilderCatalog.species[0]!.id,
      classId: quickFighter.id,
      level: 1,
    })

    const patch = sync.apply(
      {
        ...setup,
        [QUICK_NPC_REQUIRED_WEAPON_FIELD_NAME]: [
          'srd-cc-5.2.1:weapon-not-in-catalog',
          'srd-cc-5.2.1:another-invalid-weapon',
        ],
        [QUICK_NPC_REQUIRED_SPELL_FIELD_NAME]: [],
      },
      ['classId'],
    )

    expect(patch).toEqual({
      [QUICK_NPC_REQUIRED_WEAPON_FIELD_NAME]: [],
      [QUICK_NPC_REQUIRED_SPELL_FIELD_NAME]: [],
    })
  })

  it('returns undefined when setup keys are unchanged', () => {
    const sync = createQuickNpcFormValueSyncs(buildContext)[0]!

    const patch = sync.apply(
      {
        ...quickNpcMemberSetupWithNoTitle({
          speciesId: populatedBuilderCatalog.species[0]!.id,
          classId: quickFighter.id,
          level: 1,
        }),
        [QUICK_NPC_REQUIRED_WEAPON_FIELD_NAME]: [],
        [QUICK_NPC_REQUIRED_SPELL_FIELD_NAME]: [],
      },
      ['name'],
    )

    expect(patch).toBeUndefined()
  })
})
