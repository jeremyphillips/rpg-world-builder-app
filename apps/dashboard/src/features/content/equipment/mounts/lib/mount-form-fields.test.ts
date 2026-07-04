import { describe, expect, it } from 'vitest'

import {
  expectComposedKindGroups,
  expectSeedRoundTrip,
  seedEquipmentOfKind,
  toEquipmentFormValues,
} from '../../lib/test-utils/equipment-form-test-utils'
import { fieldGroupsForEquipmentKind } from '../../lib/shared/equipment-form-registry'

const MOUNT_SEEDS = seedEquipmentOfKind('mount')

describe('mount kindFieldGroups', () => {
  it('buildFields composes identity, economy, and registered mount group', () => {
    const fields = expectComposedKindGroups('mount', 'Mount')
    expect(fields.at(-1)).toEqual(fieldGroupsForEquipmentKind('mount')?.[0])
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
