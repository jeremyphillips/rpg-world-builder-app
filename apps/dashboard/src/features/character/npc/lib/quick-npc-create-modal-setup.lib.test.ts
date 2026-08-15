import { describe, expect, it } from 'vitest'

import {
  createCampaignNpcBuilderContextFixture,
  populatedBuilderCatalog,
} from '../../lib/character-builder-fixtures'
import {
  buildQuickNpcCreateSetupSets,
  formatQuickNpcSetupCharacterSummary,
  resolveQuickNpcDefaultLevel,
  resolveQuickNpcSetupModel,
} from './quick-npc-create-modal-setup.lib'
import { createQuickNpcSetupDefaultValues } from './quick-npc-form-fields'

describe('buildQuickNpcCreateSetupSets', () => {
  const context = createCampaignNpcBuilderContextFixture({ catalog: populatedBuilderCatalog })

  it('orders species and level, omitting class at level 0', () => {
    const sets = buildQuickNpcCreateSetupSets({
      context,
      values: createQuickNpcSetupDefaultValues(context),
      onValuesChange: () => {},
    })

    expect(sets.map((set) => set.id)).toEqual(['speciesId', 'level'])
  })

  it('includes class when level progression applies', () => {
    const sets = buildQuickNpcCreateSetupSets({
      context,
      values: { speciesId: 'srd-cc-5.2.1:dwarf', classId: '', level: 1 },
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

  it('defaults to campaign minimum level', () => {
    expect(resolveQuickNpcDefaultLevel(context)).toBe(0)
  })

  it('requires species and a valid level to continue at level 0', () => {
    expect(
      resolveQuickNpcSetupModel({
        context,
        values: createQuickNpcSetupDefaultValues(context),
      }).canContinue,
    ).toBe(false)

    expect(
      resolveQuickNpcSetupModel({
        context,
        values: {
          speciesId: 'srd-cc-5.2.1:dwarf',
          classId: '',
          level: 0,
        },
      }).canContinue,
    ).toBe(true)
  })

  it('requires class when level progression applies', () => {
    expect(
      resolveQuickNpcSetupModel({
        context,
        values: {
          speciesId: 'srd-cc-5.2.1:dwarf',
          classId: '',
          level: 1,
        },
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

  it('formats classless level 0 summaries', () => {
    const values = {
      speciesId: 'srd-cc-5.2.1:dwarf',
      classId: '',
      level: 0,
    }

    expect(formatQuickNpcSetupCharacterSummary(values, context)).toBe('Dwarf · Level 0')
  })

  it('formats the setup summary with the canonical character summary line', () => {
    const values = {
      speciesId: 'srd-cc-5.2.1:dwarf',
      classId: 'srd-cc-5.2.1:fighter',
      level: 1,
    }

    expect(formatQuickNpcSetupCharacterSummary(values, context)).toBe('Dwarf · Level 1 Fighter')
    expect(
      resolveQuickNpcSetupModel({
        context,
        values,
      }).summaryLine,
    ).toBe('Dwarf · Level 1 Fighter')
  })
})
