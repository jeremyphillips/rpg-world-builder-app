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
const FORM_CTX = {}

function assertWeaponGroup(item: FormItem): GroupConfig {
  if (!('kind' in item) || item.kind !== 'group') {
    throw new Error('expected weapon form group')
  }
  return item
}

function damageGroupFromWeaponGroup(weaponGroup: GroupConfig) {
  const damageGroup = weaponGroup.fields.find(
    (field): field is Extract<(typeof weaponGroup.fields)[number], { kind: 'group' }> =>
      'kind' in field && field.kind === 'group' && field.legend === 'Damage',
  )
  if (!damageGroup || !('fields' in damageGroup)) {
    throw new Error('expected Damage group')
  }
  return damageGroup
}

describe('weapon kindFieldGroups', () => {
  it('buildFields composes identity, economy, and registered weapon group', () => {
    expectComposedKindGroups('weapon', 'Weapon')
  })

  it('uses subsection legend size on the nested Damage group', () => {
    const weaponGroup = assertWeaponGroup(weaponFormFieldGroup(FORM_CTX))
    const damageGroup = damageGroupFromWeaponGroup(weaponGroup)

    expect(damageGroup).toMatchObject({
      kind: 'group',
      legend: 'Damage',
      legendSize: 'subsection',
    })
  })

  it('binds damage directly to RollValue paths via shared atoms', () => {
    const weaponGroup = assertWeaponGroup(weaponFormFieldGroup(FORM_CTX))
    const damageGroup = damageGroupFromWeaponGroup(weaponGroup)

    expect(
      damageGroup.fields.find((field) => !('kind' in field) && field.name === 'hasDamage'),
    ).toMatchObject({
      type: 'switch',
      label: 'Deals damage',
    })

    const damageRow = damageGroup.fields.find(
      (field): field is Extract<(typeof damageGroup.fields)[number], { kind: 'row' }> =>
        'kind' in field &&
        field.kind === 'row' &&
        field.fields.some(
          (child) =>
            !('kind' in child) && child.type === 'inlineSentence' && child.name === 'damage',
        ),
    )
    if (!damageRow || !('fields' in damageRow)) {
      throw new Error('expected damage roll row')
    }

    expect(
      damageRow.fields.find((field) => !('kind' in field) && field.name === 'damage.flat'),
    ).toMatchObject({
      label: 'Flat modifier',
      width: 'auto',
    })

    expect(
      damageRow.fields.find((field) => !('kind' in field) && field.name === 'damageType'),
    ).toMatchObject({
      label: 'Type',
      placeholder: 'Choose…',
    })
  })

  it('keeps versatile damage on diceFormula for dice-only rolls', () => {
    const weaponGroup = assertWeaponGroup(weaponFormFieldGroup(FORM_CTX))
    const damageGroup = damageGroupFromWeaponGroup(weaponGroup)
    const versatileRow = damageGroup.fields.find(
      (field): field is Extract<(typeof damageGroup.fields)[number], { kind: 'row' }> =>
        'kind' in field &&
        field.kind === 'row' &&
        field.fields.some((child) => !('kind' in child) && child.name === 'versatileDamage'),
    )
    if (!versatileRow || !('fields' in versatileRow)) {
      throw new Error('expected versatile damage row')
    }

    expect(
      versatileRow.fields.find((field) => !('kind' in field) && field.name === 'versatileDamage'),
    ).toMatchObject({
      type: 'diceFormula',
      modifierMode: 'none',
      size: 'md',
      width: 'auto',
    })
  })

  it('uses Choose... placeholders for required weapon selects', () => {
    const weaponGroup = assertWeaponGroup(weaponFormFieldGroup(FORM_CTX))
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
    const weaponGroup = assertWeaponGroup(weaponFormFieldGroup(FORM_CTX))
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
  })

  it('wires property and mastery conditional option availability and dynamic hints', () => {
    const weaponGroup = assertWeaponGroup(weaponFormFieldGroup(FORM_CTX))
    const propertiesField = weaponGroup.fields.find(
      (field) => !('kind' in field) && field.name === 'properties',
    )
    expect(propertiesField).toMatchObject({
      optionAvailability: { dependsOn: ['mode'] },
      dynamicHint: { dependsOn: ['mode'] },
    })
  })
})

describe('damageToForm', () => {
  it('maps dice damage to RollValue form shape', () => {
    expect(damageToForm({ dice: { count: 2, faces: 6 } })).toEqual({
      hasDamage: true,
      damage: { dice: { count: 2, faces: 6 } },
    })
  })

  it('maps flat damage to RollValue form shape', () => {
    expect(damageToForm({ flat: 1 })).toEqual({
      hasDamage: true,
      damage: { flat: 1 },
    })
  })

  it('maps combined dice and flat damage', () => {
    expect(damageToForm({ dice: { count: 1, faces: 8 }, flat: 2 })).toEqual({
      hasDamage: true,
      damage: { dice: { count: 1, faces: 8 }, flat: 2 },
    })
  })

  it('maps absent damage to hasDamage false', () => {
    expect(damageToForm(undefined)).toEqual({ hasDamage: false })
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

    it(`${item.slug}: preserves damage as RollValue`, () => {
      if (item.kind !== 'weapon' || !item.damage) return
      const formValues = toEquipmentFormValues(item)
      expect(formValues.hasDamage).toBe(true)
      expect(formValues.damage).toEqual(item.damage)
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

  it('maps net to hasDamage false', () => {
    const net = WEAPON_SEEDS.find((item) => item.slug === 'net')
    expect(net).toBeDefined()
    const formValues = toEquipmentFormValues(net! as WeaponEquipment)
    expect(formValues.hasDamage).toBe(false)
  })
})
