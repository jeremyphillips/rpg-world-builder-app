import { describe, expect, it } from 'vitest'

import {
  DAMAGE_TYPE_ENTRIES,
  DAMAGE_TYPE_IDS,
  PHYSICAL_DAMAGE_TYPE_IDS,
  damageTypeIdsByCategory,
  damageTypeSchema,
  getDamageTypeEntry,
  getDamageTypeLabel,
} from './damage-type'

describe('damageTypeSchema', () => {
  it('accepts every known damage type', () => {
    for (const id of DAMAGE_TYPE_IDS) {
      expect(damageTypeSchema.parse(id)).toBe(id)
    }
  })

  it('rejects unknown damage types and the removed "none" sentinel', () => {
    expect(damageTypeSchema.safeParse('none').success).toBe(false)
    expect(damageTypeSchema.safeParse('sonic').success).toBe(false)
    expect(damageTypeSchema.safeParse('fire').success).toBe(true)
  })
})

describe('damage type vocabulary', () => {
  it('derives DAMAGE_TYPE_IDS from the entry map', () => {
    expect([...DAMAGE_TYPE_IDS].sort()).toEqual(Object.keys(DAMAGE_TYPE_ENTRIES).sort())
  })

  it('has a category, label, and description for every type', () => {
    for (const id of DAMAGE_TYPE_IDS) {
      const entry = getDamageTypeEntry(id)
      expect(entry?.category).toBeTruthy()
      expect(entry?.label).toBeTruthy()
      expect(entry?.description).toBeTruthy()
    }
  })

  it('returns labels and falls back for unknown ids', () => {
    expect(getDamageTypeLabel('fire')).toBe('Fire')
    expect(getDamageTypeLabel('custom')).toBe('custom')
  })
})

describe('damageTypeIdsByCategory', () => {
  it('groups types by category', () => {
    expect(damageTypeIdsByCategory('physical').sort()).toEqual(
      ['bludgeoning', 'piercing', 'slashing'].sort(),
    )
    expect(damageTypeIdsByCategory('elemental')).toContain('fire')
    expect(damageTypeIdsByCategory('planar')).toContain('necrotic')
  })

  it('exposes the physical subset as a non-empty tuple matching the category filter', () => {
    expect([...PHYSICAL_DAMAGE_TYPE_IDS].sort()).toEqual(damageTypeIdsByCategory('physical').sort())
  })
})
