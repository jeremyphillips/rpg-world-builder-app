import { describe, expect, it } from 'vitest'
import { loadSeedEquipment } from '@rpg/catalog/equipment'
import { createEquipmentInputSchema } from '@rpg/contracts'

import { equipmentFormDef, type EquipmentFormValues } from '../../lib/equipment-form-def'
import { fieldGroupsForEquipmentKind } from '../../lib/shared/equipment-form-registry'

const MOUNT_SEEDS = loadSeedEquipment('srd-cc-5.2.1').filter((item) => item.kind === 'mount')

describe('mount kindFieldGroups', () => {
  it('buildFields composes identity, economy, and registered mount group', () => {
    const fields = equipmentFormDef.buildFields({ equipmentKind: 'mount' })
    const legends = fields
      .filter(
        (field): field is Extract<(typeof fields)[number], { kind: 'group' }> =>
          'kind' in field && field.kind === 'group',
      )
      .map((field) => field.legend)

    expect(legends).toEqual(['Identity', 'Economy', 'Mount'])
    expect(fields.at(-1)).toEqual(fieldGroupsForEquipmentKind('mount')?.[0])
  })
})

describe('mount form round-trips', () => {
  for (const item of MOUNT_SEEDS) {
    it(`${item.slug}: toFormValues → toInput → schema.parse`, () => {
      const formValues = equipmentFormDef.toFormValues(item) as EquipmentFormValues
      const input = equipmentFormDef.toInput(formValues)
      expect(() => createEquipmentInputSchema.parse(input)).not.toThrow()
    })

    it(`${item.slug}: preserves mount fields`, () => {
      if (item.kind !== 'mount') return
      const formValues = equipmentFormDef.toFormValues(item) as EquipmentFormValues
      expect(formValues.carryingCapacity).toBe(item.carryingCapacity.value)
      expect(formValues.speed).toBe(item.speed)
    })
  }
})
