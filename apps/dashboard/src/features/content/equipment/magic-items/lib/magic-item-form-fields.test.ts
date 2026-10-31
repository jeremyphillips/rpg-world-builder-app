import { describe, expect, it } from 'vitest'

import {
  expectComposedKindGroups,
  expectSeedRoundTrip,
  seedEquipmentOfKind,
  toEquipmentFormValues,
} from '../../lib/test-utils/equipment-form-test-utils'

const MAGIC_ITEM_SEEDS = seedEquipmentOfKind('magic_item')

describe('magic item kindFieldGroups', () => {
  it('buildFields composes name, kind group, economy, and description', () => {
    expectComposedKindGroups('magic_item', '')
  })
})

describe('magic item form round-trips', () => {
  for (const item of MAGIC_ITEM_SEEDS) {
    it(`${item.slug}: toFormValues → toInput → schema.parse`, () => {
      expectSeedRoundTrip(item)
    })

    it(`${item.slug}: preserves magic item fields`, () => {
      if (item.kind !== 'magic_item') return
      const formValues = toEquipmentFormValues(item)
      expect(formValues.rarity).toBe(item.rarity)
      expect(formValues.requiresAttunement).toBe(item.requiresAttunement)
      expect(formValues.magicItemCategory).toBe(item.magicItemCategory)
    })
  }
})
