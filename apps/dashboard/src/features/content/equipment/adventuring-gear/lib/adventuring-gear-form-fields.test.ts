import { describe, expect, it } from 'vitest'
import { loadSeedEquipment } from '@rpg/catalog/equipment'
import { createEquipmentInputSchema } from '@rpg/contracts'

import { equipmentFormDef, type EquipmentFormValues } from '../../lib/equipment-form-def'
import { fieldGroupsForEquipmentKind } from '../../lib/shared/equipment-form-registry'

const ADVENTURING_GEAR_SEEDS = loadSeedEquipment('srd-cc-5.2.1').filter(
  (item) => item.kind === 'adventuring_gear',
)

describe('adventuring gear kindFieldGroups', () => {
  it('buildFields composes identity, economy, and registered adventuring gear group', () => {
    const fields = equipmentFormDef.buildFields({ equipmentKind: 'adventuring_gear' })
    const legends = fields
      .filter(
        (field): field is Extract<(typeof fields)[number], { kind: 'group' }> =>
          'kind' in field && field.kind === 'group',
      )
      .map((field) => field.legend)

    expect(legends).toEqual(['Identity', 'Economy', 'Adventuring Gear'])
    expect(fields.at(-1)).toEqual(fieldGroupsForEquipmentKind('adventuring_gear')?.[0])
  })
})

describe('adventuring gear form round-trips', () => {
  for (const item of ADVENTURING_GEAR_SEEDS) {
    it(`${item.slug}: toFormValues → toInput → schema.parse`, () => {
      const formValues = equipmentFormDef.toFormValues(item) as EquipmentFormValues
      const input = equipmentFormDef.toInput(formValues)
      expect(() => createEquipmentInputSchema.parse(input)).not.toThrow()
    })

    it(`${item.slug}: preserves adventuring gear fields`, () => {
      if (item.kind !== 'adventuring_gear') return
      const formValues = equipmentFormDef.toFormValues(item) as EquipmentFormValues
      expect(formValues.gearKind).toBe(item.gearKind)
      expect(formValues.bundleSize).toBe(item.bundleSize)
      expect(formValues.storage).toBe(item.storage)
      expect(formValues.capacity).toBe(item.capacity)
      expect(formValues.holySymbolUsage).toEqual(item.holySymbolUsage)
      expect(formValues.alsoWeaponSlug).toBe(item.alsoWeaponSlug)
    })
  }
})
