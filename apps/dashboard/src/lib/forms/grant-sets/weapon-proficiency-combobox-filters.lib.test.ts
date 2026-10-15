import { describe, expect, it } from 'vitest'

import {
  buildWeaponProficiencyGrantComboboxFilters,
  WEAPON_PROFICIENCY_FILTER_KEYS,
} from './weapon-proficiency-combobox-filters.lib'

describe('buildWeaponProficiencyGrantComboboxFilters', () => {
  it('aligns dimension keys with equipment metadata ssot', () => {
    const filters = buildWeaponProficiencyGrantComboboxFilters()
    expect(filters.map((f) => f.filterKey)).toEqual([
      WEAPON_PROFICIENCY_FILTER_KEYS.category,
      WEAPON_PROFICIENCY_FILTER_KEYS.mode,
    ])
    expect(filters[0]?.options.length).toBeGreaterThan(0)
    expect(filters[1]?.options.length).toBeGreaterThan(0)
  })
})
