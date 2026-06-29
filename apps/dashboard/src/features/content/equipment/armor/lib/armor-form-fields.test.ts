import { describe, expect, it } from 'vitest'
import { loadSeedEquipment } from '@rpg/catalog/equipment'
import { createEquipmentInputSchema } from '@rpg/contracts'

import { equipmentFormDef, type EquipmentFormValues } from '../../lib/equipment-form-def'
import { armorFormFieldGroup } from './armor-form-fields'

const ARMOR_SEEDS = loadSeedEquipment('srd-cc-5.2.1').filter((item) => item.kind === 'armor')

describe('armor kindFieldGroups', () => {
  it('buildFields composes identity, economy, and registered armor group', () => {
    const fields = equipmentFormDef.buildFields({ equipmentKind: 'armor' })
    const legends = fields
      .filter(
        (field): field is Extract<(typeof fields)[number], { kind: 'group' }> =>
          'kind' in field && field.kind === 'group',
      )
      .map((field) => field.legend)

    expect(legends).toEqual(['Identity', 'Economy', 'Armor'])
    expect(fields.at(-1)).toMatchObject({ kind: 'group', legend: 'Armor' })
  })

  it('shows strength requirement only for heavy armor', () => {
    const armorGroup = armorFormFieldGroup()
    if (!('fields' in armorGroup)) {
      throw new Error('expected armor form group')
    }

    const strengthField = armorGroup.fields.find(
      (field) => !('kind' in field) && field.name === 'strengthRequirement',
    )
    expect(strengthField).toMatchObject({
      visibility: {
        dependsOn: ['armorCategory'],
      },
    })
    if (strengthField && 'visibility' in strengthField && strengthField.visibility) {
      expect(strengthField.visibility.visibleWhen({ armorCategory: 'heavy' })).toBe(true)
      expect(strengthField.visibility.visibleWhen({ armorCategory: 'medium' })).toBe(false)
      expect(strengthField.visibility.visibleWhen({ armorCategory: 'light' })).toBe(false)
      expect(strengthField.visibility.visibleWhen({ armorCategory: 'shields' })).toBe(false)
    }
  })
})

describe('armor form round-trips', () => {
  for (const item of ARMOR_SEEDS) {
    it(`${item.slug}: toFormValues → toInput → schema.parse`, () => {
      const formValues = equipmentFormDef.toFormValues(item) as EquipmentFormValues
      const input = equipmentFormDef.toInput(formValues)
      expect(() => createEquipmentInputSchema.parse(input)).not.toThrow()
    })

    it(`${item.slug}: preserves armor fields`, () => {
      if (item.kind !== 'armor') return
      const formValues = equipmentFormDef.toFormValues(item) as EquipmentFormValues
      expect(formValues.armorCategory).toBe(item.category)
      expect(formValues.baseAc).toBe(item.baseAc)
      expect(formValues.acBonus).toBe(item.acBonus)
      expect(formValues.addDexModifier).toBe(item.addDexModifier)
      expect(formValues.stealthDisadvantage).toBe(item.stealthDisadvantage)
    })
  }
})
