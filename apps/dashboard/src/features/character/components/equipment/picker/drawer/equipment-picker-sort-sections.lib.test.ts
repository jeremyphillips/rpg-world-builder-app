import { describe, expect, it } from 'vitest'

import {
  EQUIPMENT_PICKER_SORT_BEST_MATCH,
  EQUIPMENT_PICKER_SORT_NAME_ASC,
  EQUIPMENT_PICKER_SORT_PRICE_ASC,
} from './equipment-picker-drawer.types'
import {
  normalizeEquipmentPickerSortMode,
  resolveEquipmentPickerAvailableSortModes,
} from './equipment-picker-sort-sections.lib'

describe('equipment-picker-sort-sections.lib', () => {
  it('lists purchase workflow modes in menu order from the catalog-sort registry', () => {
    expect(resolveEquipmentPickerAvailableSortModes(false)).toEqual([
      EQUIPMENT_PICKER_SORT_BEST_MATCH,
      'price_asc',
      'price_desc',
      'name_asc',
      'name_desc',
      'date_desc',
      'date_asc',
    ])
  })

  it('omits price modes on magic-items workflow', () => {
    const modes = resolveEquipmentPickerAvailableSortModes(true)

    expect(modes).not.toContain('price_asc')
    expect(modes).not.toContain('price_desc')
    expect(modes[0]).toBe(EQUIPMENT_PICKER_SORT_BEST_MATCH)
    expect(modes.some((mode) => mode.startsWith('date_'))).toBe(true)
  })

  it('normalizes obsolete sort modes to best match', () => {
    expect(
      normalizeEquipmentPickerSortMode(EQUIPMENT_PICKER_SORT_PRICE_ASC, [
        EQUIPMENT_PICKER_SORT_BEST_MATCH,
        EQUIPMENT_PICKER_SORT_NAME_ASC,
      ]),
    ).toBe(EQUIPMENT_PICKER_SORT_BEST_MATCH)

    expect(
      normalizeEquipmentPickerSortMode(EQUIPMENT_PICKER_SORT_NAME_ASC, [
        EQUIPMENT_PICKER_SORT_BEST_MATCH,
        EQUIPMENT_PICKER_SORT_NAME_ASC,
      ]),
    ).toBe(EQUIPMENT_PICKER_SORT_NAME_ASC)
  })
})
