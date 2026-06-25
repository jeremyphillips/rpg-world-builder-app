import { describe, expect, it } from 'vitest'
import { loadSeedEquipment } from '@rpg/catalog/equipment'
import { createEquipmentInputSchema } from '@rpg/contracts'

import { equipmentFormDef, type EquipmentFormValues } from '../../lib/equipment-form-def'
import { fieldGroupsForEquipmentKind } from '../../lib/shared/equipment-form-registry'

const SERVICE_SEEDS = loadSeedEquipment('srd-cc-5.2.1').filter((item) => item.kind === 'service')

describe('service kindFieldGroups', () => {
  it('buildFields composes identity, economy, and registered service group', () => {
    const fields = equipmentFormDef.buildFields({ equipmentKind: 'service' })
    const legends = fields
      .filter(
        (field): field is Extract<(typeof fields)[number], { kind: 'group' }> =>
          'kind' in field && field.kind === 'group',
      )
      .map((field) => field.legend)

    expect(legends).toEqual(['Identity', 'Economy', 'Service'])
    expect(fields.at(-1)).toEqual(fieldGroupsForEquipmentKind('service')?.[0])
  })
})

describe('service form round-trips', () => {
  for (const item of SERVICE_SEEDS) {
    it(`${item.slug}: toFormValues → toInput → schema.parse`, () => {
      const formValues = equipmentFormDef.toFormValues(item) as EquipmentFormValues
      const input = equipmentFormDef.toInput(formValues)
      expect(() => createEquipmentInputSchema.parse(input)).not.toThrow()
    })

    it(`${item.slug}: preserves service fields`, () => {
      if (item.kind !== 'service') return
      const formValues = equipmentFormDef.toFormValues(item) as EquipmentFormValues
      expect(formValues.serviceCategory).toBe(item.serviceCategory)
      expect(formValues.duration).toEqual(item.duration)
      expect(formValues.notes).toBe(item.notes)
    })
  }
})
