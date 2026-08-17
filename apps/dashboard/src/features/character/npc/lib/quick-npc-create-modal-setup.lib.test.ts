import { describe, expect, it } from 'vitest'

import {
  createCampaignNpcBuilderContextFixture,
  populatedBuilderCatalog,
} from '../../lib/character-builder-fixtures'
import {
  QUICK_NPC_CLASS_AFFINITY_GROUP_EYEBROW,
  QUICK_NPC_CLASS_ALL_GROUP_EYEBROW,
} from './quick-npc-class-option-groups.lib'
import {
  buildQuickNpcCreateSetupSets,
  formatQuickNpcSetupCharacterSummary,
  resolveQuickNpcDefaultLevel,
  resolveQuickNpcSetupModel,
} from './quick-npc-create-modal-setup.lib'
import { createQuickNpcSetupDefaultValues } from './quick-npc-form-fields'

describe('buildQuickNpcCreateSetupSets', () => {
  const context = createCampaignNpcBuilderContextFixture({ catalog: populatedBuilderCatalog })
  const rogueClass = {
    ...populatedBuilderCatalog.classes[0]!,
    id: 'srd-cc-5.2.1:rogue',
    slug: 'rogue',
    name: 'Rogue',
  }
  const multiClassContext = createCampaignNpcBuilderContextFixture({
    catalog: {
      ...populatedBuilderCatalog,
      classes: [populatedBuilderCatalog.classes[0]!, rogueClass],
    },
  })

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

  it('groups class options by organization member class affinities when survivors exist', () => {
    const sets = buildQuickNpcCreateSetupSets({
      context: multiClassContext,
      values: { speciesId: 'srd-cc-5.2.1:dwarf', classId: '', level: 1 },
      onValuesChange: () => {},
      memberClassAffinityIds: [rogueClass.id],
    })

    const classSet = sets.find((set) => set.id === 'classId')
    expect(classSet?.kind).toBe('choice')
    if (classSet?.kind !== 'choice') throw new Error('expected class choice set')
    expect(classSet.optionGroups).toEqual([
      {
        id: 'recommended',
        eyebrow: QUICK_NPC_CLASS_AFFINITY_GROUP_EYEBROW,
        options: [{ value: rogueClass.id, label: 'Rogue' }],
      },
      {
        id: 'all-classes',
        eyebrow: QUICK_NPC_CLASS_ALL_GROUP_EYEBROW,
        options: [{ value: 'srd-cc-5.2.1:fighter', label: 'Fighter' }],
      },
    ])
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
