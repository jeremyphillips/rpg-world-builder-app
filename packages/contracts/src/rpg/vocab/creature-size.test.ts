import { describe, expect, it } from 'vitest'

import {
  CREATURE_SIZE_ENTRIES,
  CREATURE_SIZES,
  creatureSizeSchema,
  creatureSizesDraftSchema,
  creatureSizesSchema,
  formatCreatureSizeList,
  getCreatureSizeEntry,
  getCreatureSizeLabel,
  getCreatureSizeSentenceForm,
  resolveLargestCreatureSize,
  sortCreatureSizes,
  type CreatureSize,
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

describe('creatureSizesSchema', () => {
  it('requires at least one size and rejects duplicates and unknown ids', () => {
    expect(creatureSizesSchema.parse(['medium', 'small'])).toEqual(['medium', 'small'])
    expect(creatureSizesSchema.safeParse([]).success).toBe(false)
    expect(creatureSizesSchema.safeParse(['medium', 'medium']).success).toBe(false)
    expect(creatureSizesSchema.safeParse(['colossal']).success).toBe(false)
  })

  it('allows an empty draft and still rejects duplicates', () => {
    expect(creatureSizesDraftSchema.parse(undefined)).toEqual([])
    expect(creatureSizesDraftSchema.safeParse(['small', 'small']).success).toBe(false)
    expect(creatureSizesDraftSchema.safeParse(['colossal']).success).toBe(false)
  })
})

describe('creature size order', () => {
  it('sorts by rank without mutating, dropping, or uniquing the input', () => {
    const input: CreatureSize[] = ['small', 'medium', 'small']
    expect(sortCreatureSizes(input)).toEqual(['medium', 'small', 'small'])
    expect(sortCreatureSizes(input, 'asc')).toEqual(['small', 'small', 'medium'])
    expect(input).toEqual(['small', 'medium', 'small'])
  })

  it('resolves the largest size from rank', () => {
    expect(resolveLargestCreatureSize([])).toBeUndefined()
    expect(resolveLargestCreatureSize(['small', 'medium'])).toBe('medium')
    expect(resolveLargestCreatureSize(['medium', 'small'])).toBe('medium')
  })

  it('formats size lists in descending rank', () => {
    expect(formatCreatureSizeList([])).toBe('')
    expect(formatCreatureSizeList(['medium'])).toBe('Medium')
    expect(formatCreatureSizeList(['small', 'medium'])).toBe('Medium or Small')
    expect(formatCreatureSizeList(['medium', 'small'])).toBe('Medium or Small')
    expect(formatCreatureSizeList(['tiny', 'large'])).toBe('Large or Tiny')
    expect(formatCreatureSizeList(['small', 'medium', 'large'])).toBe('Large, Medium, or Small')
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

  it('gives every size a unique rank that increases with size', () => {
    const ranks = CREATURE_SIZES.map((size) => CREATURE_SIZE_ENTRIES[size].rank)
    expect(new Set(ranks).size).toBe(ranks.length)
    const ordered = [...CREATURE_SIZES].sort(
      (left, right) => CREATURE_SIZE_ENTRIES[left].rank - CREATURE_SIZE_ENTRIES[right].rank,
    )
    expect(ordered).toEqual(['tiny', 'small', 'medium', 'large', 'huge', 'gargantuan'])
  })

  it('returns counted creature size sentence forms', () => {
    expect(getCreatureSizeSentenceForm('medium', 1)).toBe('medium creature')
    expect(getCreatureSizeSentenceForm('medium', 2)).toBe('medium creatures')
    expect(getCreatureSizeSentenceForm('gargantuan', 2)).toBe('gargantuan creatures')
  })
})
