import { describe, expect, it } from 'vitest'

import {
  ARMOR_MATERIALS,
  ARMOR_MATERIAL_ENTRIES,
  armorMaterialSchema,
  getArmorMaterialEntry,
  getArmorMaterialLabel,
} from './material'

describe('armorMaterialSchema', () => {
  it('accepts every known material', () => {
    for (const material of ARMOR_MATERIALS) {
      expect(armorMaterialSchema.parse(material)).toBe(material)
    }
  })

  it('rejects unknown materials', () => {
    expect(armorMaterialSchema.safeParse('cloth').success).toBe(false)
  })
})

describe('armor material vocabulary', () => {
  it('exposes every material in ARMOR_MATERIALS', () => {
    expect([...ARMOR_MATERIALS].sort()).toEqual(Object.keys(ARMOR_MATERIAL_ENTRIES).sort())
  })

  it('has a label and description for every material', () => {
    for (const material of ARMOR_MATERIALS) {
      const entry = getArmorMaterialEntry(material)
      expect(entry?.label).toBeTruthy()
      expect(entry?.description).toBeTruthy()
    }
  })

  it('returns labels and falls back for unknown materials', () => {
    expect(getArmorMaterialLabel('organic')).toBe('Non-Metal')
    expect(getArmorMaterialLabel('metal')).toBe('Metal')
    expect(getArmorMaterialLabel('custom')).toBe('custom')
  })
})
