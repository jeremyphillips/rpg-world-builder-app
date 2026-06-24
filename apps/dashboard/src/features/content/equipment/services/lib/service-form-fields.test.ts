import { describe, expect, it } from 'vitest'
import { loadSeedEquipment } from '@rpg/catalog/equipment'
import { createEquipmentInputSchema } from '@rpg/contracts'

import { equipmentFormDef, type EquipmentFormValues } from '../../lib/equipment-form-def'

const SERVICE_SEEDS = loadSeedEquipment('srd-cc-5.2.1').filter((item) => item.kind === 'service')

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
      expect(formValues.duration).toBe(item.duration)
      expect(formValues.notes).toBe(item.notes)
    })
  }
})
