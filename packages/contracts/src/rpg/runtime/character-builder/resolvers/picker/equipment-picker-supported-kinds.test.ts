import { describe, expect, it } from 'vitest'

import { EQUIPMENT_KINDS } from '../../../../content/equipment'
import {
  EQUIPMENT_PICKER_EXCLUDED_KINDS,
  EQUIPMENT_PICKER_SUPPORTED_KINDS,
  isEquipmentPickerSupportedKind,
} from './equipment-picker-supported-kinds'

describe('equipment-picker-supported-kinds', () => {
  it('covers every catalog kind except vehicles and services', () => {
    expect(
      [...EQUIPMENT_PICKER_SUPPORTED_KINDS, ...EQUIPMENT_PICKER_EXCLUDED_KINDS].sort(),
    ).toEqual([...EQUIPMENT_KINDS].sort())
    expect(EQUIPMENT_PICKER_EXCLUDED_KINDS).toEqual(['vehicle', 'service'])
  })

  it('identifies supported kinds', () => {
    expect(isEquipmentPickerSupportedKind('weapon')).toBe(true)
    expect(isEquipmentPickerSupportedKind('vehicle')).toBe(false)
    expect(isEquipmentPickerSupportedKind('service')).toBe(false)
  })
})
