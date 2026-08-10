import { describe, expect, it } from 'vitest'

import {
  createCampaignNpcBuilderContextFixture,
  populatedBuilderCatalog,
} from '../../lib/character-builder-fixtures'
import {
  buildQuickNpcCreateSetupSets,
  resolveQuickNpcSetupModel,
} from './quick-npc-create-modal-setup.lib'
import { EMPTY_QUICK_NPC_SETUP_VALUES } from './quick-npc-form-fields'

describe('buildQuickNpcCreateSetupSets', () => {
  const context = createCampaignNpcBuilderContextFixture({ catalog: populatedBuilderCatalog })

  it('orders species, level, and class sets', () => {
    const sets = buildQuickNpcCreateSetupSets({
      context,
      values: EMPTY_QUICK_NPC_SETUP_VALUES,
      onValuesChange: () => {},
    })

    expect(sets.map((set) => set.id)).toEqual(['speciesId', 'level', 'classId'])
    expect(sets[0]?.kind).toBe('choice')
    expect(sets[1]?.kind).toBe('number')
    expect(sets[2]?.kind).toBe('choice')
  })

  it('keeps level expanded while complete', () => {
    const sets = buildQuickNpcCreateSetupSets({
      context,
      values: { speciesId: 'srd-cc-5.2.1:dwarf', classId: '', level: 1 },
      onValuesChange: () => {},
    })

    expect(sets[1]?.collapseWhenComplete).toBe(false)
    expect(sets[1]?.isComplete).toBe(true)
  })
})

describe('resolveQuickNpcSetupModel', () => {
  const context = createCampaignNpcBuilderContextFixture({ catalog: populatedBuilderCatalog })

  it('requires species, class, and a valid level to continue', () => {
    expect(
      resolveQuickNpcSetupModel({
        context,
        values: EMPTY_QUICK_NPC_SETUP_VALUES,
      }).canContinue,
    ).toBe(false)

    expect(
      resolveQuickNpcSetupModel({
        context,
        values: {
          speciesId: 'srd-cc-5.2.1:dwarf',
          classId: 'srd-cc-5.2.1:fighter',
          level: 1,
        },
      }).canContinue,
    ).toBe(true)
  })
})
