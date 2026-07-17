import { describe, expect, it } from 'vitest'

import {
  CREATURE_SIZES,
  creatureSizeSchema,
  getCreatureSizeEntry,
  getCreatureSizeLabel,
  getCreatureSizeSentenceForm,
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

  it('returns counted creature size sentence forms', () => {
    expect(getCreatureSizeSentenceForm('medium', 1)).toBe('medium creature')
    expect(getCreatureSizeSentenceForm('medium', 2)).toBe('medium creatures')
    expect(getCreatureSizeSentenceForm('gargantuan', 2)).toBe('gargantuan creatures')
  })
})
