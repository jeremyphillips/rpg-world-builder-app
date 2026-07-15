import { describe, expect, it } from 'vitest'

import { pickEquipment } from '../../../lib/fixtures/pick'
import {
  expectComposedKindGroups,
  expectSeedRoundTrip,
  seedEquipmentOfKind,
  toEquipmentFormValues,
} from '../../lib/test-utils/equipment-form-test-utils'
import { fieldGroupsForEquipmentKind } from '../../lib/shared/equipment-form-registry'
import { getMountStatRows } from './mount-form-fields'

const MOUNT_SEEDS = seedEquipmentOfKind('mount')

describe('mount kindFieldGroups', () => {
  it('buildFields composes name, kind group, economy, and description', () => {
    const fields = expectComposedKindGroups('mount', '')
    const kindGroup = fields.find(
      (field) => 'kind' in field && field.kind === 'group' && field.legend === '',
    )
    expect(kindGroup).toEqual(fieldGroupsForEquipmentKind('mount')?.[0])
  })
})

describe('getMountStatRows', () => {
  it('returns carrying capacity and speed for a riding horse', () => {
    const horse = pickEquipment('riding-horse')
    if (horse.kind !== 'mount') throw new Error('expected mount')

    const rows = getMountStatRows(horse)
    expect(rows).toEqual([
      { label: 'Carrying capacity', value: '480 lb' },
      { label: 'Speed', value: '60 ft.' },
    ])
  })

  it('returns carrying capacity for a mule without speed when absent', () => {
    const mule = pickEquipment('mule')
    if (mule.kind !== 'mount') throw new Error('expected mount')

    const rows = getMountStatRows(mule)
    expect(rows.some((row) => row.label === 'Carrying capacity' && row.value === '420 lb')).toBe(
      true,
    )
    expect(rows.some((row) => row.label === 'Speed' && row.value === '40 ft.')).toBe(true)
  })
})

describe('mount form round-trips', () => {
  for (const item of MOUNT_SEEDS) {
    it(`${item.slug}: toFormValues → toInput → schema.parse`, () => {
      expectSeedRoundTrip(item)
    })

    it(`${item.slug}: preserves mount fields`, () => {
      if (item.kind !== 'mount') return
      const formValues = toEquipmentFormValues(item)
      expect(formValues.carryingCapacity).toEqual(item.carryingCapacity)
      expect(formValues.speed).toEqual(item.speed)
    })
  }
})
