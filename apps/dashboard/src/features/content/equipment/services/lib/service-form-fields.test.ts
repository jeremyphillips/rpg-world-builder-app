import { describe, expect, it } from 'vitest'

import {
  expectComposedKindGroups,
  expectSeedRoundTrip,
  seedEquipmentOfKind,
  toEquipmentFormValues,
} from '../../lib/test-utils/equipment-form-test-utils'
import { fieldGroupsForEquipmentKind } from '../../lib/shared/equipment-form-registry'

const SERVICE_SEEDS = seedEquipmentOfKind('service')

describe('service kindFieldGroups', () => {
  it('buildFields composes name, kind group, economy, and description', () => {
    const fields = expectComposedKindGroups('service', '')
    const kindGroup = fields.find(
      (field) => 'kind' in field && field.kind === 'group' && field.legend === '',
    )
    expect(kindGroup).toEqual(fieldGroupsForEquipmentKind('service')?.[0])
  })
})

describe('service form round-trips', () => {
  for (const item of SERVICE_SEEDS) {
    it(`${item.slug}: toFormValues → toInput → schema.parse`, () => {
      expectSeedRoundTrip(item)
    })

    it(`${item.slug}: preserves service fields`, () => {
      if (item.kind !== 'service') return
      const formValues = toEquipmentFormValues(item)
      expect(formValues.serviceCategory).toBe(item.serviceCategory)
      expect(formValues.duration).toEqual(item.duration)
      expect(formValues.notes).toBe(item.notes)
    })
  }
})
