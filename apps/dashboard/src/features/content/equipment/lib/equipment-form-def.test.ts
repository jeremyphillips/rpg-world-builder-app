import { describe, expect, expectTypeOf, it } from 'vitest'
import { loadSeedEquipment } from '@rpg/catalog/equipment'
import { createEquipmentInputSchema, type CreateEquipmentInput } from '@rpg/contracts'

import { equipmentFormDef, type EquipmentFormValues } from './equipment-form-def'

const SRD_EQUIPMENT = loadSeedEquipment('srd-cc-5.2.1')

it('type: toInput return type matches CreateEquipmentInput', () => {
  expectTypeOf(equipmentFormDef.toInput).returns.toEqualTypeOf<CreateEquipmentInput>()
})

describe('equipmentFormDef round-trips', () => {
  for (const item of SRD_EQUIPMENT) {
    it(`${item.slug}: toFormValues → toInput → schema.parse`, () => {
      const formValues = equipmentFormDef.toFormValues(item) as EquipmentFormValues
      const input = equipmentFormDef.toInput(formValues)
      expect(() => createEquipmentInputSchema.parse(input)).not.toThrow()
    })

    it(`${item.slug}: name and kind preserved`, () => {
      const formValues = equipmentFormDef.toFormValues(item) as EquipmentFormValues
      const input = equipmentFormDef.toInput(formValues)
      expect(input.name).toBe(item.name)
      expect(input.kind).toBe(item.kind)
    })
  }
})
