import { describe, expect, it } from 'vitest'
import { getEquipmentBySlug } from '@rpg/catalog/equipment'
import {
  ARMOR_CLASS_RULES_MATRIX,
  DEFAULT_SYSTEM_RULESET_ID,
  armorClassFromProtection,
  isArmorEquipment,
} from '@rpg/contracts'

import {
  UNARMORED_BASE_EXAMPLE_PLATE_OFFSET,
  unarmoredBaseShiftHint,
} from './mechanics-form-fields'

describe('unarmoredBaseShiftHint', () => {
  it('uses the stored plate offset', () => {
    const plate = getEquipmentBySlug(DEFAULT_SYSTEM_RULESET_ID, 'plate-armor')
    expect(isArmorEquipment(plate) && plate.baseAcOffset).toBe(UNARMORED_BASE_EXAMPLE_PLATE_OFFSET)
  })

  it('shows plate through the scale for every rules pair', () => {
    for (const rules of ARMOR_CLASS_RULES_MATRIX) {
      const plate = armorClassFromProtection(rules, UNARMORED_BASE_EXAMPLE_PLATE_OFFSET)
      expect(
        unarmoredBaseShiftHint({
          armorClassMode: rules.mode,
          armorClassBase: String(rules.base),
        }),
      ).toBe(
        `The baseline for an unarmored character. Changing it shifts the displayed AC of every armor. Plate: ${plate}.`,
      )
    }
  })

  it('shows plate at 17 for base 9 ascending', () => {
    expect(unarmoredBaseShiftHint({ armorClassMode: 'ascending', armorClassBase: '9' })).toContain(
      'Plate: 17.',
    )
  })

  it('returns undefined until both knobs are selected', () => {
    expect(unarmoredBaseShiftHint({ armorClassMode: 'ascending' })).toBeUndefined()
    expect(unarmoredBaseShiftHint({ armorClassBase: '9' })).toBeUndefined()
  })
})
