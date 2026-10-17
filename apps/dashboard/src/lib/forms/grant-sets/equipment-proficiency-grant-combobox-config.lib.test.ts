import { describe, expect, it } from 'vitest'
import { buildContentPurposeSelectors } from '@rpg/contracts'

import { pickEquipment } from '@/features/content'

import { WEAPON_PROFICIENCY_COMBOBOX_FILTER_KEYS } from './weapon-proficiency-combobox-filters.lib'
import { equipmentProficiencyGrantComboboxConfig } from './equipment-proficiency-grant-combobox-config.lib'

describe('equipmentProficiencyGrantComboboxConfig', () => {
  it('pairs weapon combobox options with aligned filter dimensions', () => {
    const config = equipmentProficiencyGrantComboboxConfig(
      buildContentPurposeSelectors([pickEquipment('greataxe')]),
      'weapon',
    )

    expect(config.itemOptions[0]?.filterValues).toMatchObject({
      category: expect.any(String),
      mode: expect.any(String),
    })
    expect(config.itemsCombobox.filterSelects?.map((row) => row.filterKey)).toEqual([
      WEAPON_PROFICIENCY_COMBOBOX_FILTER_KEYS.category,
      WEAPON_PROFICIENCY_COMBOBOX_FILTER_KEYS.mode,
    ])
  })
})
