import { describe, expect, it } from 'vitest'
import type { GroupConfig, RowConfig } from '@rpg/ui/form'

import {
  expectComposedKindGroups,
  expectSeedRoundTrip,
  seedEquipmentOfKind,
  toEquipmentFormValues,
} from '../../lib/test-utils/equipment-form-test-utils'
import { fieldGroupsForEquipmentKind } from '../../lib/shared/equipment-form-registry'
import { vehicleFormFieldGroup } from './vehicle-form-fields'

const VEHICLE_SEEDS = seedEquipmentOfKind('vehicle')

describe('vehicle kindFieldGroups', () => {
  it('buildFields composes identity, economy, and registered vehicle group', () => {
    const fields = expectComposedKindGroups('vehicle', 'Vehicle')
    expect(fields.at(-1)).toEqual(fieldGroupsForEquipmentKind('vehicle')?.[0])
  })

  it('uses one responsive-4 grid row for cargo, speed, crew, and passengers', () => {
    const group = vehicleFormFieldGroup()
    if (!('kind' in group) || group.kind !== 'group') {
      throw new Error('Expected vehicle group fields')
    }

    const rows: RowConfig[] = group.fields.filter(
      (field): field is RowConfig => 'kind' in field && field.kind === 'row',
    )
    const combatGroup = group.fields.find(
      (field): field is GroupConfig =>
        'kind' in field && field.kind === 'group' && field.legend === 'Combat',
    )

    const [statsRow] = rows
    if (!statsRow || !combatGroup) {
      throw new Error('Expected vehicle stats row and combat subgroup')
    }

    expect(statsRow).toMatchObject({
      kind: 'row',
      layout: 'responsive-4',
      className: 'w-fit max-w-full md:grid-cols-[auto_auto_auto_auto]',
    })
    expect(statsRow.fields).toEqual([
      expect.objectContaining({ name: 'cargoCapacity', width: 'auto' }),
      expect.objectContaining({ name: 'speed', width: 'auto' }),
      expect.objectContaining({ name: 'crew', width: 'auto' }),
      expect.objectContaining({ name: 'passengers', width: 'auto' }),
    ])

    expect(combatGroup).toMatchObject({
      kind: 'group',
      legend: 'Combat',
      legendSize: 'subsection',
    })
    expect(combatGroup.fields).toEqual([
      expect.objectContaining({
        kind: 'row',
        fields: [
          expect.objectContaining({ name: 'ac', label: 'AC' }),
          expect.objectContaining({ name: 'hp', label: 'HP' }),
          expect.objectContaining({ name: 'damageThreshold', label: 'Damage threshold' }),
        ],
      }),
    ])
  })
})

describe('vehicle form round-trips', () => {
  for (const item of VEHICLE_SEEDS) {
    it(`${item.slug}: toFormValues → toInput → schema.parse`, () => {
      expectSeedRoundTrip(item)
    })

    it(`${item.slug}: preserves vehicle fields`, () => {
      if (item.kind !== 'vehicle') return
      const formValues = toEquipmentFormValues(item)
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
