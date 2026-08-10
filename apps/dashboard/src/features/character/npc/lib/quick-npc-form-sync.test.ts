import { describe, expect, it } from 'vitest'

import {
  createCampaignNpcBuilderContextFixture,
  populatedBuilderCatalog,
} from '../../lib/character-builder-fixtures'
import {
  QUICK_NPC_REQUIRED_WEAPON_FIELD_NAME,
  type QuickNpcSetupValues,
} from './quick-npc-form-fields'
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
  it('clears a weapon requirement when setup changes make it unreachable', () => {
    const sync = createQuickNpcFormValueSyncs(buildContext)[0]!
    const setup: QuickNpcSetupValues = {
      speciesId: populatedBuilderCatalog.species[0]!.id,
      classId: quickFighter.id,
      level: 1,
    }

    const patch = sync.apply(
      {
        ...setup,
        [QUICK_NPC_REQUIRED_WEAPON_FIELD_NAME]: 'srd-cc-5.2.1:weapon-not-in-catalog',
      },
      ['classId'],
    )

    expect(patch).toEqual({ [QUICK_NPC_REQUIRED_WEAPON_FIELD_NAME]: '' })
  })

  it('returns undefined when setup keys are unchanged', () => {
    const sync = createQuickNpcFormValueSyncs(buildContext)[0]!

    const patch = sync.apply(
      {
        speciesId: populatedBuilderCatalog.species[0]!.id,
        classId: quickFighter.id,
        level: 1,
        [QUICK_NPC_REQUIRED_WEAPON_FIELD_NAME]: '',
      },
      ['name'],
    )

    expect(patch).toBeUndefined()
  })
})
