import { EQUIPMENT_KINDS } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import {
  EQUIPMENT_FAMILY_PATHS,
  equipmentKindToFamilyPath,
  familyPathToEquipmentKind,
  isEquipmentFamilyPath,
} from './equipment-family-paths'

describe('equipment family paths', () => {
  it('covers every equipment kind with a family path', () => {
    expect(EQUIPMENT_FAMILY_PATHS).toHaveLength(EQUIPMENT_KINDS.length)

    for (const kind of EQUIPMENT_KINDS) {
      const path = equipmentKindToFamilyPath(kind)
      expect(isEquipmentFamilyPath(path)).toBe(true)
      expect(familyPathToEquipmentKind(path)).toBe(kind)
    }
  })
})
