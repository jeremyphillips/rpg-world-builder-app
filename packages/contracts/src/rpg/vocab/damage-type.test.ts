import { describe, expect, it } from 'vitest'

import { DAMAGE_TYPE_SET_ID, damageTypeIdSchema, getDamageTypeLabel } from './damage/vocabulary'
import {
  getPhysicalDamageTypeEntry,
  PHYSICAL_DAMAGE_TYPE_IDS,
  physicalDamageTypeSchema,
} from './damage/physical'

describe('damageTypeIdSchema', () => {
  it('accepts slug-shaped ids including campaign custom terms', () => {
    expect(damageTypeIdSchema.parse('fire')).toBe('fire')
    expect(damageTypeIdSchema.parse('custom-sonic')).toBe('custom-sonic')
  })

  it('rejects invalid slug shapes', () => {
    expect(damageTypeIdSchema.safeParse('Bad Slug').success).toBe(false)
    expect(damageTypeIdSchema.safeParse('fire').success).toBe(true)
  })
})

describe('physicalDamageTypeSchema', () => {
  it('accepts only the three physical damage types', () => {
    for (const id of PHYSICAL_DAMAGE_TYPE_IDS) {
      expect(physicalDamageTypeSchema.parse(id)).toBe(id)
    }
    expect(physicalDamageTypeSchema.safeParse('fire').success).toBe(false)
  })
})

describe('damage type vocabulary', () => {
  it('registers the damage type option set id', () => {
    expect(DAMAGE_TYPE_SET_ID).toBe('damage-types')
  })

  it('has a label and description for every physical type', () => {
    for (const id of PHYSICAL_DAMAGE_TYPE_IDS) {
      const entry = getPhysicalDamageTypeEntry(id)
      expect(entry?.label).toBeTruthy()
      expect(entry?.description).toBeTruthy()
    }
  })

  it('returns labels and falls back for unknown ids', () => {
    expect(getDamageTypeLabel('fire')).toBe('Fire')
    expect(getDamageTypeLabel('bludgeoning')).toBe('Bludgeoning')
    expect(getDamageTypeLabel('custom-sonic')).toBe('Custom Sonic')
  })
})
