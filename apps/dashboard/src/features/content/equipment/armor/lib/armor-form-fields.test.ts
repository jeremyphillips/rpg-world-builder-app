import { describe, expect, it } from 'vitest'

import {
  expectComposedKindGroups,
  expectSeedRoundTrip,
  seedEquipmentOfKind,
  toEquipmentFormValues,
} from '../../lib/test-utils/equipment-form-test-utils'
import { armorFormFieldGroup } from './armor-form-fields'

const ARMOR_SEEDS = seedEquipmentOfKind('armor')

describe('armor kindFieldGroups', () => {
  it('buildFields composes identity, economy, and registered armor group', () => {
    expectComposedKindGroups('armor', '')
  })

  it('shows strength requirement only for heavy armor', () => {
    const armorGroup = armorFormFieldGroup()
    if (!('fields' in armorGroup)) {
      throw new Error('expected armor form group')
    }

    const strengthField = armorGroup.fields.find(
      (field) => !('kind' in field) && field.name === 'strengthRequirement',
    )
    expect(strengthField).toMatchObject({
      visibility: {
        dependsOn: ['armorCategory'],
      },
    })
    if (strengthField && 'visibility' in strengthField && strengthField.visibility) {
      expect(strengthField.visibility.visibleWhen({ armorCategory: 'heavy' })).toBe(true)
      expect(strengthField.visibility.visibleWhen({ armorCategory: 'medium' })).toBe(false)
      expect(strengthField.visibility.visibleWhen({ armorCategory: 'light' })).toBe(false)
      expect(strengthField.visibility.visibleWhen({ armorCategory: 'shields' })).toBe(false)
    }
  })
})

describe('armor form round-trips', () => {
  for (const item of ARMOR_SEEDS) {
    it(`${item.slug}: toFormValues → toInput → schema.parse`, () => {
      expectSeedRoundTrip(item)
    })

    it(`${item.slug}: preserves armor fields`, () => {
      if (item.kind !== 'armor') return
      const formValues = toEquipmentFormValues(item)
      expect(formValues.armorCategory).toBe(item.category)
      expect(formValues.baseAc).toBe(item.baseAc)
      expect(formValues.acBonus).toBe(item.acBonus)
      expect(formValues.addDexModifier).toBe(item.addDexModifier)
      expect(formValues.stealthDisadvantage).toBe(item.stealthDisadvantage)
    })
  }
})
