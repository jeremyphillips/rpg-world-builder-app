import { describe, expect, it } from 'vitest'
import type { WeaponEquipment } from '@rpg/contracts'
import type { FormItem, GroupConfig } from '@rpg/ui/form'

import {
  expectComposedKindGroups,
  expectSeedRoundTrip,
  seedEquipmentOfKind,
  toEquipmentFormValues,
} from '../../lib/test-utils/equipment-form-test-utils'
import { weaponFormFieldGroup } from './weapon-form-fields'
import { damageToForm } from './weapon-form-values'

const WEAPON_SEEDS = seedEquipmentOfKind('weapon')

function assertWeaponGroup(item: FormItem): GroupConfig {
  if (!('kind' in item) || item.kind !== 'group') {
    throw new Error('expected weapon form group')
  }
  return item
}

function damageRowFromWeaponGroup(weaponGroup: GroupConfig) {
  const damageGroup = weaponGroup.fields.find(
    (field): field is Extract<(typeof weaponGroup.fields)[number], { kind: 'group' }> =>
      'kind' in field && field.kind === 'group' && field.legend === 'Damage',
  )
  if (!damageGroup || !('fields' in damageGroup)) {
    throw new Error('expected Damage group')
  }

  const damageRow = damageGroup.fields.find(
    (field): field is Extract<(typeof damageGroup.fields)[number], { kind: 'row' }> =>
      'kind' in field &&
      field.kind === 'row' &&
      field.fields.some((child) => !('kind' in child) && child.name === 'damageKind'),
  )
  if (!damageRow || !('fields' in damageRow)) {
    throw new Error('expected damage row')
  }

  return damageRow
}

describe('weapon kindFieldGroups', () => {
  it('buildFields composes identity, economy, and registered weapon group', () => {
    expectComposedKindGroups('weapon', 'Weapon')
  })

  it('uses subsection legend size on the nested Damage group', () => {
    const weaponGroup = assertWeaponGroup(weaponFormFieldGroup())
    const damageGroup = weaponGroup.fields.find(
      (field): field is Extract<(typeof weaponGroup.fields)[number], { kind: 'group' }> =>
        'kind' in field && field.kind === 'group' && field.legend === 'Damage',
    )

    expect(damageGroup).toMatchObject({
      kind: 'group',
      legend: 'Damage',
      legendSize: 'subsection',
    })
  })

  it('uses diceFormula fields with auto width for damage and versatile damage', () => {
    const weaponGroup = assertWeaponGroup(weaponFormFieldGroup())
    const damageRow = damageRowFromWeaponGroup(weaponGroup)

    expect(
      damageRow.fields.find((field) => !('kind' in field) && field.name === 'damageDice'),
    ).toMatchObject({
      label: 'Dice',
      modifierMode: 'none',
      size: 'md',
      width: 'auto',
    })

    expect(
      damageRow.fields.find((field) => !('kind' in field) && field.name === 'versatileDamage'),
    ).toMatchObject({
      name: 'versatileDamage',
      label: 'Versatile dice',
      modifierMode: 'none',
      size: 'md',
      width: 'auto',
    })
  })

  it('composes damage kind, damage type, and dice damage in one row', () => {
    const weaponGroup = assertWeaponGroup(weaponFormFieldGroup())
    const damageRow = damageRowFromWeaponGroup(weaponGroup)

    expect(damageRow.fields).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'damageKind', width: 'md', defaultValue: 'dice' }),
        expect.objectContaining({
          name: 'damageType',
          width: 'md',
          placeholder: 'Choose...',
          visibility: expect.objectContaining({ dependsOn: ['damageKind'] }),
        }),
        expect.objectContaining({
          name: 'damageDice',
          width: 'auto',
          visibility: expect.objectContaining({ dependsOn: ['damageKind'] }),
        }),
      ]),
    )
  })

  it('offers none as a damage option for weapons like the net', () => {
    const weaponGroup = assertWeaponGroup(weaponFormFieldGroup())
    const damageRow = damageRowFromWeaponGroup(weaponGroup)
    const damageKindField = damageRow.fields.find(
      (field) => !('kind' in field) && field.name === 'damageKind',
    )

    expect(damageKindField).toMatchObject({
      options: expect.arrayContaining([{ value: 'none', label: 'None' }]),
    })
    expect(
      weaponGroup.fields.find(
        (field) => !('kind' in field) && field.name === 'hasDamage' && field.type === 'switch',
      ),
    ).toBeUndefined()
  })

  it('uses Choose... placeholders for required weapon selects', () => {
    const weaponGroup = assertWeaponGroup(weaponFormFieldGroup())
    const coreRow = weaponGroup.fields.find(
      (field): field is Extract<(typeof weaponGroup.fields)[number], { kind: 'row' }> =>
        'kind' in field &&
        field.kind === 'row' &&
        field.fields.some((child) => !('kind' in child) && child.name === 'category'),
    )
    if (!coreRow || !('fields' in coreRow)) {
      throw new Error('expected category/mode/mastery row')
    }

    for (const name of ['category', 'mode', 'mastery'] as const) {
      expect(
        coreRow.fields.find((field) => !('kind' in field) && field.name === name),
      ).toMatchObject({ placeholder: 'Choose...' })
    }
  })

  it('wires range visibility from mode and thrown property', () => {
    const weaponGroup = assertWeaponGroup(weaponFormFieldGroup())
    const rangeGroup = weaponGroup.fields.find(
      (field): field is Extract<(typeof weaponGroup.fields)[number], { kind: 'group' }> =>
        'kind' in field && field.kind === 'group' && field.legend === 'Range',
    )
    if (!rangeGroup || !('fields' in rangeGroup)) {
      throw new Error('expected Range group')
    }

    expect(rangeGroup).toMatchObject({
      legendSize: 'subsection',
      visibility: {
        dependsOn: ['mode', 'properties'],
      },
    })

    const rangeRow = rangeGroup.fields.find(
      (field): field is Extract<(typeof rangeGroup.fields)[number], { kind: 'row' }> =>
        'kind' in field &&
        field.kind === 'row' &&
        field.fields.some((child) => !('kind' in child) && child.name === 'rangeNormal'),
    )
    if (!rangeRow || !('fields' in rangeRow)) {
      throw new Error('expected range row')
    }

    for (const [name, label] of [
      ['rangeNormal', 'Normal'],
      ['rangeLong', 'Long'],
    ] as const) {
      expect(
        rangeRow.fields.find((field) => !('kind' in field) && field.name === name),
      ).toMatchObject({
        type: 'inlineSentence',
        label,
        width: 'auto',
        segments: [
          { kind: 'number', name, min: 0, digits: 3 },
          { kind: 'text', value: 'ft.', tone: 'label' },
        ],
      })
    }
  })

  it('wires property and mastery conditional option availability and dynamic hints', () => {
    const weaponGroup = assertWeaponGroup(weaponFormFieldGroup())
    const propertiesField = weaponGroup.fields.find(
      (field) => !('kind' in field) && field.name === 'properties',
    )
    expect(propertiesField).toMatchObject({
      optionAvailability: { dependsOn: ['mode'] },
      dynamicHint: { dependsOn: ['mode'] },
    })

    const coreRow = weaponGroup.fields.find(
      (field): field is Extract<(typeof weaponGroup.fields)[number], { kind: 'row' }> =>
        'kind' in field &&
        field.kind === 'row' &&
        field.fields.some((child) => !('kind' in child) && child.name === 'mastery'),
    )
    if (!coreRow || !('fields' in coreRow)) {
      throw new Error('expected mastery field row')
    }

    expect(
      coreRow.fields.find((field) => !('kind' in field) && field.name === 'mastery'),
    ).toMatchObject({
      optionAvailability: { dependsOn: ['mode'] },
      dynamicHint: { dependsOn: ['mode'] },
    })
  })
})

describe('damageToForm', () => {
  it('maps dice damage to damageDice', () => {
    expect(damageToForm({ dice: { count: 2, faces: 6 } })).toEqual({
      damageKind: 'dice',
      damageDice: { count: 2, faces: 6 },
    })
  })

  it('maps flat damage to damageAmount', () => {
    expect(damageToForm({ flat: 1 })).toEqual({
      damageKind: 'flat',
      damageAmount: 1,
    })
  })

  it('maps absent damage to none', () => {
    expect(damageToForm(undefined)).toEqual({ damageKind: 'none' })
  })
})

describe('weapon form round-trips', () => {
  for (const item of WEAPON_SEEDS) {
    it(`${item.slug}: toFormValues → toInput → schema.parse`, () => {
      expectSeedRoundTrip(item)
    })

    it(`${item.slug}: preserves weapon fields`, () => {
      if (item.kind !== 'weapon') return
      const formValues = toEquipmentFormValues(item)
      expect(formValues.category).toBe(item.category)
      expect(formValues.mode).toBe(item.mode)
      expect(formValues.mastery).toBe(item.mastery)
      expect(formValues.properties).toEqual(item.properties)
    })

    it(`${item.slug}: preserves dice damage as damageDice`, () => {
      if (item.kind !== 'weapon' || !item.damage?.dice) return
      const formValues = toEquipmentFormValues(item)
      expect(formValues.damageDice).toEqual({
        count: item.damage.dice.count,
        faces: item.damage.dice.faces,
      })
    })

    it(`${item.slug}: preserves versatile damage as versatileDamage`, () => {
      if (item.kind !== 'weapon' || !item.versatileDamage) return
      const formValues = toEquipmentFormValues(item)
      expect(formValues.versatileDamage).toEqual({
        count: item.versatileDamage.count,
        faces: item.versatileDamage.faces,
      })
    })
  }

  it('maps net to damageKind none', () => {
    const net = WEAPON_SEEDS.find((item) => item.slug === 'net')
    expect(net).toBeDefined()
    const formValues = toEquipmentFormValues(net! as WeaponEquipment)
    expect(formValues.damageKind).toBe('none')
  })
})
