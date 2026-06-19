import { describe, expect, it } from 'vitest'

import {
  CREATURE_SIZES,
  CREATURE_SIZE_ENTRIES,
  creatureSizeSchema,
  getCreatureSizeEntry,
  getCreatureSizeLabel,
} from './creature-size'

describe('creatureSizeSchema', () => {
  it('accepts every known size', () => {
    for (const size of CREATURE_SIZES) {
      expect(creatureSizeSchema.parse(size)).toBe(size)
    }
  })

  it('rejects unknown sizes', () => {
    expect(creatureSizeSchema.safeParse('colossal').success).toBe(false)
    expect(creatureSizeSchema.safeParse('medium').success).toBe(true)
  })
})

describe('creature size vocabulary', () => {
  it('derives CREATURE_SIZES from the entry map', () => {
    expect([...CREATURE_SIZES].sort()).toEqual(Object.keys(CREATURE_SIZE_ENTRIES).sort())
  })

  it('has a label and description for every size', () => {
    for (const size of CREATURE_SIZES) {
      const entry = getCreatureSizeEntry(size)
      expect(entry?.label).toBeTruthy()
      expect(entry?.description).toBeTruthy()
    }
  })

  it('returns labels and falls back for unknown ids', () => {
    expect(getCreatureSizeLabel('medium')).toBe('Medium')
    expect(getCreatureSizeLabel('custom')).toBe('custom')
  })
})
