import { describe, expect, it } from 'vitest'
import { buildContentPurposeSelectors } from '@rpg/contracts'

import { pickEquipment, referenceWeaponComboboxFieldOptions } from '@/features/content'

describe('character configuration rules equipment options', () => {
  it('builds weapon field options with combobox filter metadata', () => {
    const weaponOptions = referenceWeaponComboboxFieldOptions(
      buildContentPurposeSelectors([pickEquipment('greataxe')]),
    )

    expect(weaponOptions[0]?.filterValues).toMatchObject({
      category: expect.any(String),
      mode: expect.any(String),
    })
  })
})
