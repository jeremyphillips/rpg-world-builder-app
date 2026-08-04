import { describe, expect, it } from 'vitest'

import {
  EQUIPMENT_FAMILY_PATHS,
  equipmentKindToFamilyPath,
  familyPathToEquipmentKind,
  getEquipmentFamilyLabel,
  isEquipmentFamilyPath,
} from './family-path'

describe('equipment family path helpers', () => {
  it('maps equipment kinds to overview path segments', () => {
    expect(equipmentKindToFamilyPath('weapon')).toBe('weapons')
    expect(familyPathToEquipmentKind('weapons')).toBe('weapon')
    expect(getEquipmentFamilyLabel('weapons')).toBeTruthy()
  })

  it('validates known family paths', () => {
    for (const path of EQUIPMENT_FAMILY_PATHS) {
      expect(isEquipmentFamilyPath(path)).toBe(true)
    }
    expect(isEquipmentFamilyPath('unknown')).toBe(false)
  })
})
