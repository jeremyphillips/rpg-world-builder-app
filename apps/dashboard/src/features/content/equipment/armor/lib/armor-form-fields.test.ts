import type { FormItem } from '@rpg/ui/form'
import type { Equipment } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import { equipmentFormDef } from '../../lib/equipment-form-def'
import {
  expectComposedKindGroups,
  expectSeedRoundTrip,
  seedEquipmentOfKind,
  toEquipmentFormValues,
} from '../../lib/test-utils/equipment-form-test-utils'
import {
  ARMOR_ABILITY_SCORE_REQUIREMENTS_FIELD,
  ARMOR_MINIMUM_STRENGTH_REQUIREMENT_SWITCH,
} from './armor-ability-score-requirements-form'
import { armorFormFieldGroup } from './armor-form-fields'

const ARMOR_SEEDS = seedEquipmentOfKind('armor')

type ArmorSeed = Extract<Equipment, { kind: 'armor' }>

function armorSeed(slug: string): ArmorSeed {
  const item = ARMOR_SEEDS.find((seed) => seed.slug === slug)
  if (!item || item.kind !== 'armor') throw new Error(`missing armor seed ${slug}`)
  return item
}

function findStrengthRequirementDependent(): Extract<FormItem, { kind: 'dependent' }> {
  const armorGroup = armorFormFieldGroup()
  if (!('fields' in armorGroup)) throw new Error('expected armor form group')
  const fields: readonly FormItem[] = armorGroup.fields
  const dependent = fields.find(
    (field): field is Extract<FormItem, { kind: 'dependent' }> =>
      'kind' in field &&
      field.kind === 'dependent' &&
      'name' in field.controller &&
      field.controller.name === ARMOR_MINIMUM_STRENGTH_REQUIREMENT_SWITCH,
  )
  if (!dependent) throw new Error('expected strength requirement dependent')
  return dependent
}

function toInputWith(item: ArmorSeed, overrides: Record<string, unknown>) {
  const values = { ...toEquipmentFormValues(item), ...overrides }
  return equipmentFormDef.toInput(values) as Extract<
    ReturnType<typeof equipmentFormDef.toInput>,
    { kind: 'armor' }
  >
}

describe('armor kindFieldGroups', () => {
  it('buildFields composes identity, economy, and registered armor group', () => {
    expectComposedKindGroups('armor', '')
  })

  it('gates the STR minimum behind a switch offered on every armor category', () => {
    const dependent = findStrengthRequirementDependent()

    expect(dependent.controller).toMatchObject({
      type: 'switch',
      label: 'Minimum Strength requirement',
    })
    expect('visibility' in dependent.controller && dependent.controller.visibility).toBeFalsy()
    expect(dependent.dependents.fields).toEqual([
      expect.objectContaining({
        type: 'number',
        name: `${ARMOR_ABILITY_SCORE_REQUIREMENTS_FIELD}.str`,
        label: 'Minimum STR score',
      }),
    ])
  })
})

describe('armor ability-score requirement form values', () => {
  it('loads an existing STR minimum with the switch on', () => {
    const values = toEquipmentFormValues(armorSeed('plate-armor'))

    expect(values.hasMinimumStrengthRequirement).toBe(true)
    expect(values.abilityScoreRequirements).toEqual({ str: 15 })
  })

  it('loads armor without a minimum with the switch off', () => {
    expect(toEquipmentFormValues(armorSeed('ring-mail')).hasMinimumStrengthRequirement).toBe(false)
    expect(toEquipmentFormValues(armorSeed('shield')).hasMinimumStrengthRequirement).toBe(false)
  })

  it('omits the map when the switch is off', () => {
    const input = toInputWith(armorSeed('plate-armor'), {
      [ARMOR_MINIMUM_STRENGTH_REQUIREMENT_SWITCH]: false,
    })

    expect(input).not.toHaveProperty('abilityScoreRequirements')
  })

  it('writes { str } when the switch is on, including shields', () => {
    const input = toInputWith(armorSeed('shield'), {
      [ARMOR_MINIMUM_STRENGTH_REQUIREMENT_SWITCH]: true,
      abilityScoreRequirements: { str: 15 },
    })

    expect(input.abilityScoreRequirements).toEqual({ str: 15 })
  })

  it('never sends the form-only switch', () => {
    const input = toInputWith(armorSeed('plate-armor'), {})

    expect(input).not.toHaveProperty(ARMOR_MINIMUM_STRENGTH_REQUIREMENT_SWITCH)
    expect(input.abilityScoreRequirements).toEqual({ str: 15 })
  })

  it('preserves other authored abilities when the STR switch is off', () => {
    const input = toInputWith(
      { ...armorSeed('plate-armor'), abilityScoreRequirements: { str: 15, dex: 12 } },
      { [ARMOR_MINIMUM_STRENGTH_REQUIREMENT_SWITCH]: false },
    )

    expect(input.abilityScoreRequirements).toEqual({ dex: 12 })
  })
})

describe('armor form round-trips', () => {
  for (const item of ARMOR_SEEDS) {
    it(`${item.slug}: toFormValues → toInput → schema.parse`, () => {
      expectSeedRoundTrip(item)
    })

    it(`${item.slug}: preserves armor fields`, () => {
      if (item.kind !== 'armor') return
      const formValues = toEquipmentFormValues(item)
      expect(formValues.armorCategory).toBe(item.category)
      expect(formValues.baseAc).toBe(item.baseAc)
      expect(formValues.acBonus).toBe(item.acBonus)
      expect(formValues.addDexModifier).toBe(item.addDexModifier)
      expect(formValues.stealthDisadvantage).toBe(item.stealthDisadvantage)
    })
  }
})
