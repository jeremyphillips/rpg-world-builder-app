import { describe, expect, it } from 'vitest'

import {
  expectComposedKindGroups,
  expectSeedRoundTrip,
  seedEquipmentOfKind,
  toEquipmentFormValues,
} from '../../lib/test-utils/equipment-form-test-utils'
import { fieldGroupsForEquipmentKind } from '../../lib/shared/equipment-form-registry'

const ADVENTURING_GEAR_SEEDS = seedEquipmentOfKind('adventuring_gear')

describe('adventuring gear kindFieldGroups', () => {
  it('buildFields composes name, kind group, economy, and description', () => {
    const fields = expectComposedKindGroups('adventuring_gear', '')
    const kindGroup = fields.find(
      (field) => 'kind' in field && field.kind === 'group' && field.legend === '',
    )
    expect(kindGroup).toEqual(fieldGroupsForEquipmentKind('adventuring_gear')?.[0])
  })
})

describe('adventuring gear form round-trips', () => {
  for (const item of ADVENTURING_GEAR_SEEDS) {
    it(`${item.slug}: toFormValues → toInput → schema.parse`, () => {
      expectSeedRoundTrip(item)
    })

    it(`${item.slug}: preserves adventuring gear fields`, () => {
      if (item.kind !== 'adventuring_gear') return
      const formValues = toEquipmentFormValues(item)
      expect(formValues.gearKind).toBe(item.gearKind)
      expect(formValues.bundleSize).toBe(item.bundleSize)
      expect(formValues.storage).toBe(item.storage)
      expect(formValues.capacity).toBe(item.capacity)
      expect(formValues.holySymbolUsage).toEqual(item.holySymbolUsage)
      expect(formValues.alsoWeaponSlug).toBe(item.alsoWeaponSlug)
    })
  }
})
