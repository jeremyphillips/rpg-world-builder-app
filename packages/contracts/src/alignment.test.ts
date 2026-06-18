import { describe, expect, it } from 'vitest'

import {
  ALIGNMENTS,
  ALIGNMENT_ENTRIES,
  alignmentSchema,
  formatAlignmentLabel,
  getAlignmentEntry,
  getAlignmentLabel,
} from './alignment'

describe('alignmentSchema', () => {
  it('accepts every known alignment', () => {
    for (const alignment of ALIGNMENTS) {
      expect(alignmentSchema.parse(alignment)).toBe(alignment)
    }
  })

  it('rejects unknown alignments', () => {
    expect(alignmentSchema.safeParse('true-neutral').success).toBe(false)
    expect(alignmentSchema.safeParse('lg').success).toBe(true)
  })
})

describe('alignment vocabulary', () => {
  it('exposes every alignment in ALIGNMENTS', () => {
    expect([...ALIGNMENTS].sort()).toEqual(Object.keys(ALIGNMENT_ENTRIES).sort())
  })

  it('has a label and description for every alignment', () => {
    for (const alignment of ALIGNMENTS) {
      const entry = getAlignmentEntry(alignment)
      expect(entry?.label).toBeTruthy()
      expect(entry?.description).toBeTruthy()
    }
  })

  it('returns labels and falls back for unknown alignments', () => {
    expect(getAlignmentLabel('lg')).toBe('Lawful Good')
    expect(getAlignmentLabel('n')).toBe('Neutral')
    expect(getAlignmentLabel('custom')).toBe('custom')
  })

  it('formats labels with SRD abbreviations', () => {
    expect(formatAlignmentLabel('lg')).toBe('Lawful Good (LG)')
    expect(formatAlignmentLabel('n')).toBe('Neutral (N)')
    expect(formatAlignmentLabel('unknown')).toBe('unknown')
  })
})
