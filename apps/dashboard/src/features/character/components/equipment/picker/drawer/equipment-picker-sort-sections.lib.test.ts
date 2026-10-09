import { describe, expect, it } from 'vitest'

import {
  EQUIPMENT_PICKER_SORT_BEST_MATCH,
  EQUIPMENT_PICKER_SORT_DATE_ASC,
  EQUIPMENT_PICKER_SORT_DATE_DESC,
  EQUIPMENT_PICKER_SORT_MODES,
  EQUIPMENT_PICKER_SORT_NAME_ASC,
  EQUIPMENT_PICKER_SORT_NAME_DESC,
  EQUIPMENT_PICKER_SORT_PRICE_ASC,
} from './equipment-picker-drawer.types'
import {
  buildEquipmentPickerSortSections,
  normalizeEquipmentPickerSortMode,
} from './equipment-picker-sort-sections.lib'

describe('equipment-picker-sort-sections.lib', () => {
  it('delegates grouped sections to the catalog-sort registry', () => {
    const sections = buildEquipmentPickerSortSections(EQUIPMENT_PICKER_SORT_MODES)

    expect(
      sections.map((section) => ('heading' in section ? section.heading : 'ungrouped')),
    ).toEqual(['ungrouped', 'Price', 'Name', 'Date created'])
    expect(sections[0]).toMatchObject({
      type: 'ungrouped',
      options: [{ value: EQUIPMENT_PICKER_SORT_BEST_MATCH, triggerLabel: 'Best match' }],
    })
  })

  it('omits price group when price modes are unavailable', () => {
    const sections = buildEquipmentPickerSortSections([
      EQUIPMENT_PICKER_SORT_BEST_MATCH,
      EQUIPMENT_PICKER_SORT_NAME_ASC,
      EQUIPMENT_PICKER_SORT_NAME_DESC,
      EQUIPMENT_PICKER_SORT_DATE_DESC,
      EQUIPMENT_PICKER_SORT_DATE_ASC,
    ])

    expect(
      sections.some((section) => section.type === 'group' && section.heading === 'Price'),
    ).toBe(false)
    expect(
      sections.some((section) => section.type === 'group' && section.heading === 'Date created'),
    ).toBe(true)
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
