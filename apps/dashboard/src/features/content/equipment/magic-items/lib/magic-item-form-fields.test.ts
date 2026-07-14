import { describe, expect, it } from 'vitest'

import {
  expectComposedKindGroups,
  expectSeedRoundTrip,
  seedEquipmentOfKind,
  toEquipmentFormValues,
} from '../../lib/test-utils/equipment-form-test-utils'
import { magicItemFormFieldGroup } from './magic-item-form-fields'

const MAGIC_ITEM_SEEDS = seedEquipmentOfKind('magic_item')

describe('magic item kindFieldGroups', () => {
  it('buildFields composes name, kind group, economy, and description', () => {
    expectComposedKindGroups('magic_item', '')
  })

  it('uses a responsive two-column layout for base equipment', () => {
    const group = magicItemFormFieldGroup()
    if (!('fields' in group)) throw new Error('Expected magic item group fields')

    const baseEquipmentRow = group.fields.find(
      (field): field is Extract<(typeof group.fields)[number], { kind: 'row' }> =>
        'kind' in field &&
        field.kind === 'row' &&
        field.fields.some((rowField) => 'name' in rowField && rowField.name === 'baseEquipmentId'),
    )

    expect(baseEquipmentRow).toMatchObject({ layout: 'responsive-2' })
    expect(baseEquipmentRow).not.toHaveProperty('className')
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
