import { describe, expect, it } from 'vitest'

import {
  ALIGNMENTS,
  alignmentSchema,
  formatAlignmentLabel,
  getAlignmentEntry,
  getAlignmentLabel,
  getAlignmentSentenceForm,
  optionalAlignmentSchema,
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

describe('optionalAlignmentSchema', () => {
  it('treats blank select sentinels as unset', () => {
    expect(optionalAlignmentSchema.parse('')).toBeUndefined()
    expect(optionalAlignmentSchema.parse('lg')).toBe('lg')
  })
})

describe('alignment vocabulary', () => {
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

  it('returns alignment sentence forms', () => {
    expect(getAlignmentSentenceForm('lg', 1)).toBe('lawful good')
    expect(getAlignmentSentenceForm('cn', 2)).toBe('chaotic neutrals')
  })
})
