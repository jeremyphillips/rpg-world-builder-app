import { describe, expect, it } from 'vitest'
import { loadSeedEquipment } from '@rpg/catalog/equipment'
import { createEquipmentInputSchema } from '@rpg/contracts'

import { equipmentFormDef, type EquipmentFormValues } from '../../lib/equipment-form-def'

const WEAPON_SEEDS = loadSeedEquipment('srd-cc-5.2.1').filter((item) => item.kind === 'weapon')

describe('weapon kindFieldGroups', () => {
  it('buildFields composes identity, economy, and registered weapon group', () => {
    const fields = equipmentFormDef.buildFields({ equipmentKind: 'weapon' })
    const legends = fields
      .filter(
        (field): field is Extract<(typeof fields)[number], { kind: 'group' }> =>
          'kind' in field && field.kind === 'group',
      )
      .map((field) => field.legend)

    expect(legends).toEqual(['Identity', 'Economy', 'Weapon'])
    expect(fields.at(-1)).toMatchObject({ kind: 'group', legend: 'Weapon' })
  })
})

describe('weapon form round-trips', () => {
  for (const item of WEAPON_SEEDS) {
    it(`${item.slug}: toFormValues → toInput → schema.parse`, () => {
      const formValues = equipmentFormDef.toFormValues(item) as EquipmentFormValues
      const input = equipmentFormDef.toInput(formValues)
      expect(() => createEquipmentInputSchema.parse(input)).not.toThrow()
    })

    it(`${item.slug}: preserves weapon fields`, () => {
      if (item.kind !== 'weapon') return
      const formValues = equipmentFormDef.toFormValues(item) as EquipmentFormValues
      expect(formValues.category).toBe(item.category)
      expect(formValues.mode).toBe(item.mode)
      expect(formValues.mastery).toBe(item.mastery)
      expect(formValues.properties).toEqual(item.properties)
    })
  }
})
