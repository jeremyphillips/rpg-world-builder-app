import { describe, expect, it } from 'vitest'

import type {
  EquipmentEffectTotals,
  EquipmentInstance,
  MagicPropertyDefinition,
  ResolvedEquipmentMagicProperties,
} from '@rpg/contracts'

import {
  filterPresetMagicPropertiesForBrowse,
  overlappingMechanicalModifierTargets,
  presetPropertyBrowseChoice,
} from './equipment-instance-editor.lib'

const emptyTotals: EquipmentEffectTotals = {
  attack_roll: 0,
  damage_roll: 0,
  armor_class: 0,
}

const enhancement = {
  id: 'plus-one',
  name: 'Weapon +1',
  description: 'A +1 enhancement.',
  category: 'enhancement',
  appliesTo: ['weapon'],
  effects: [{ target: 'attack_roll', bonus: 1 }],
} satisfies MagicPropertyDefinition

function magicWithEnhancement(): ResolvedEquipmentMagicProperties {
  return {
    resolved: [
      {
        entry: { kind: 'preset', propertyId: enhancement.id },
        definition: enhancement,
      },
    ],
    custom: [],
    unresolved: [],
    inapplicable: [],
  }
}

describe('overlappingMechanicalModifierTargets', () => {
  it('lists targets that combine an enhancement and a manual adjustment', () => {
    const draft: EquipmentInstance = {
      equipmentId: 'longsword',
      adjustments: [{ effectId: 'manual', target: 'attack_roll', bonus: 1 }],
    }

    expect(
      overlappingMechanicalModifierTargets({
        draft,
        magic: magicWithEnhancement(),
        totals: { ...emptyTotals, attack_roll: 2 },
      }),
    ).toEqual(['attack_roll'])
  })

  it('skips a target whose combined total is zero', () => {
    const draft: EquipmentInstance = {
      equipmentId: 'longsword',
      adjustments: [{ effectId: 'manual', target: 'attack_roll', bonus: -1 }],
    }

    expect(
      overlappingMechanicalModifierTargets({
        draft,
        magic: magicWithEnhancement(),
        totals: emptyTotals,
      }),
    ).toEqual([])
  })
})

describe('filterPresetMagicPropertiesForBrowse', () => {
  const presets = [
    enhancement,
    {
      ...enhancement,
      id: 'returning',
      name: 'Returning',
      category: 'special',
      effects: [],
    },
  ] satisfies MagicPropertyDefinition[]

  it('filters by name and enhancement category', () => {
    expect(
      filterPresetMagicPropertiesForBrowse(presets, { query: 'ret', category: 'all' }).map(
        (row) => row.id,
      ),
    ).toEqual(['returning'])
    expect(
      filterPresetMagicPropertiesForBrowse(presets, { query: '', category: 'enhancement' }).map(
        (row) => row.id,
      ),
    ).toEqual(['plus-one'])
  })
})

describe('presetPropertyBrowseChoice', () => {
  const draft: EquipmentInstance = {
    equipmentId: 'longsword',
    magicProperties: [{ kind: 'preset', propertyId: 'plus-one' }],
  }

  it('marks the current preset added and other presets as replacements', () => {
    expect(presetPropertyBrowseChoice(draft, 'plus-one')).toEqual({
      action: 'added',
      replacePropertyId: 'plus-one',
    })
    expect(presetPropertyBrowseChoice(draft, 'returning')).toEqual({
      action: 'replace',
      replacePropertyId: 'plus-one',
    })
  })

  it('offers add when the item has no preset', () => {
    expect(presetPropertyBrowseChoice({ equipmentId: 'longsword' }, 'plus-one')).toEqual({
      action: 'add',
    })
  })
})
