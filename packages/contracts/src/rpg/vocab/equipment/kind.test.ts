import { describe, expect, it } from 'vitest'

import {
  EQUIPMENT_KIND_ENTRIES,
  EQUIPMENT_KINDS,
  getEquipmentKindLabel,
  equipmentKindSchema,
} from './kind'

describe('equipmentKindSchema', () => {
  it('accepts every known equipment kind', () => {
    for (const kind of EQUIPMENT_KINDS) {
      expect(equipmentKindSchema.parse(kind)).toBe(kind)
    }
  })

  it('derives enum keys from the entry map', () => {
    expect([...EQUIPMENT_KINDS].sort()).toEqual(Object.keys(EQUIPMENT_KIND_ENTRIES).sort())
  })

  it('has a label and description for every equipment kind', () => {
    for (const kind of EQUIPMENT_KINDS) {
      const entry = EQUIPMENT_KIND_ENTRIES[kind]
      expect(entry.label).toBeTruthy()
      expect(entry.description).toBeTruthy()
    }
  })

  it('returns labels and falls back for unknown kinds', () => {
    expect(getEquipmentKindLabel('magic_item')).toBe('Magic Item')
    expect(getEquipmentKindLabel('teleporter')).toBe('teleporter')
  })
})
