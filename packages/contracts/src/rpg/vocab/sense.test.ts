import { describe, expect, it } from 'vitest'

import {
  SENSE_RANGES,
  SENSE_SET_ID,
  getSenseLabel,
  getSenseSentenceForm,
  senseIdSchema,
  senseSchema,
} from './sense'

describe('senseIdSchema', () => {
  it('accepts slug-shaped ids including campaign custom terms', () => {
    expect(senseIdSchema.parse('darkvision')).toBe('darkvision')
    expect(senseIdSchema.parse('custom-sense')).toBe('custom-sense')
  })

  it('rejects invalid slug shapes', () => {
    expect(senseIdSchema.safeParse('Bad Slug').success).toBe(false)
    expect(senseIdSchema.safeParse('darkvision').success).toBe(true)
  })
})

describe('senseSchema', () => {
  it('accepts a sense type slug and numeric range', () => {
    expect(senseSchema.parse({ type: 'darkvision', range: 60 })).toEqual({
      type: 'darkvision',
      range: 60,
    })
  })
})

describe('sense vocabulary', () => {
  it('registers the sense option set id', () => {
    expect(SENSE_SET_ID).toBe('senses')
  })

  it('exposes standard sense range presets for UI', () => {
    expect(SENSE_RANGES).toEqual([10, 30, 60, 90, 120])
  })

  it('returns title-cased slug labels', () => {
    expect(getSenseLabel('darkvision')).toBe('Darkvision')
    expect(getSenseLabel('custom-sense')).toBe('Custom Sense')
  })

  it('returns sentence forms for generated prose', () => {
    expect(getSenseSentenceForm('darkvision')).toBe('Darkvision')
    expect(getSenseSentenceForm('custom-sense')).toBe('Custom Sense')
  })
})
