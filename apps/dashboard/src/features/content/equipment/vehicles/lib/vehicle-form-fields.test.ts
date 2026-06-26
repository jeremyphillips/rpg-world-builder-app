import { describe, expect, it } from 'vitest'
import { loadSeedEquipment } from '@rpg/catalog/equipment'
import { createEquipmentInputSchema } from '@rpg/contracts'
import type { RowConfig } from '@rpg/ui/form'

import { equipmentFormDef, type EquipmentFormValues } from '../../lib/equipment-form-def'
import { fieldGroupsForEquipmentKind } from '../../lib/shared/equipment-form-registry'
import { vehicleFormFieldGroup } from './vehicle-form-fields'

const VEHICLE_SEEDS = loadSeedEquipment('srd-cc-5.2.1').filter((item) => item.kind === 'vehicle')

describe('vehicle kindFieldGroups', () => {
  it('buildFields composes identity, economy, and registered vehicle group', () => {
    const fields = equipmentFormDef.buildFields({ equipmentKind: 'vehicle' })
    const legends = fields
      .filter(
        (field): field is Extract<(typeof fields)[number], { kind: 'group' }> =>
          'kind' in field && field.kind === 'group',
      )
      .map((field) => field.legend)

    expect(legends).toEqual(['Identity', 'Economy', 'Vehicle'])
    expect(fields.at(-1)).toEqual(fieldGroupsForEquipmentKind('vehicle')?.[0])
  })

  it('uses flex auto-width for cargo/speed and responsive grid for crew/passengers', () => {
    const group = vehicleFormFieldGroup()
    if (!('kind' in group) || group.kind !== 'group') {
      throw new Error('Expected vehicle group fields')
    }

    const rows: RowConfig[] = group.fields.filter(
      (field): field is RowConfig => 'kind' in field && field.kind === 'row',
    )

    const [cargoSpeedRow, crewPassengersRow] = rows
    if (!cargoSpeedRow || !crewPassengersRow) {
      throw new Error('Expected cargo/speed and crew/passengers rows')
    }

    expect(cargoSpeedRow).toMatchObject({ kind: 'row' })
    expect(cargoSpeedRow).not.toHaveProperty('layout')
    expect(cargoSpeedRow).not.toHaveProperty('className')
    expect(cargoSpeedRow.fields).toEqual([
      expect.objectContaining({ name: 'cargoCapacity', width: 'auto' }),
      expect.objectContaining({ name: 'speed', width: 'auto' }),
    ])

    expect(crewPassengersRow).toMatchObject({ layout: 'responsive-3' })
    expect(crewPassengersRow).not.toHaveProperty('className')
  })
})

describe('vehicle form round-trips', () => {
  for (const item of VEHICLE_SEEDS) {
    it(`${item.slug}: toFormValues → toInput → schema.parse`, () => {
      const formValues = equipmentFormDef.toFormValues(item) as EquipmentFormValues
      const input = equipmentFormDef.toInput(formValues)
      expect(() => createEquipmentInputSchema.parse(input)).not.toThrow()
    })

    it(`${item.slug}: preserves vehicle fields`, () => {
      if (item.kind !== 'vehicle') return
      const formValues = equipmentFormDef.toFormValues(item) as EquipmentFormValues
      expect(formValues.vehicleCategory).toBe(item.vehicleCategory)
      expect(formValues.speed).toEqual(item.speed)
      expect(formValues.crew).toBe(item.crew)
      expect(formValues.passengers).toBe(item.passengers)
      expect(formValues.cargoCapacity).toEqual(item.cargoCapacity)
      expect(formValues.ac).toBe(item.ac)
      expect(formValues.hp).toBe(item.hp)
      expect(formValues.damageThreshold).toBe(item.damageThreshold)
    })
  }
})
