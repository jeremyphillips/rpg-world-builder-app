import { describe, expect, it } from 'vitest'
import { loadSeedEquipment } from '@rpg/catalog/equipment'
import { createEquipmentInputSchema } from '@rpg/contracts'

import { equipmentFormDef, type EquipmentFormValues } from '../../lib/equipment-form-def'

const MAGIC_ITEM_SEEDS = loadSeedEquipment('srd-cc-5.2.1').filter(
  (item) => item.kind === 'magic_item',
)

describe('magic item kindFieldGroups', () => {
  it('buildFields composes identity, economy, and registered magic item group', () => {
    const fields = equipmentFormDef.buildFields({ equipmentKind: 'magic_item' })
    const legends = fields
      .filter(
        (field): field is Extract<(typeof fields)[number], { kind: 'group' }> =>
          'kind' in field && field.kind === 'group',
      )
      .map((field) => field.legend)

    expect(legends).toEqual(['Identity', 'Economy', 'Magic Item'])
    expect(fields.at(-1)).toMatchObject({ kind: 'group', legend: 'Magic Item' })
  })
})

describe('magic item form round-trips', () => {
  for (const item of MAGIC_ITEM_SEEDS) {
    it(`${item.slug}: toFormValues → toInput → schema.parse`, () => {
      const formValues = equipmentFormDef.toFormValues(item) as EquipmentFormValues
      const input = equipmentFormDef.toInput(formValues)
      expect(() => createEquipmentInputSchema.parse(input)).not.toThrow()
    })

    it(`${item.slug}: preserves magic item fields`, () => {
      if (item.kind !== 'magic_item') return
      const formValues = equipmentFormDef.toFormValues(item) as EquipmentFormValues
      expect(formValues.rarity).toBe(item.rarity)
      expect(formValues.requiresAttunement).toBe(item.requiresAttunement)
      expect(formValues.magicItemCategory).toBe(item.magicItemCategory)
    })
  }
})
