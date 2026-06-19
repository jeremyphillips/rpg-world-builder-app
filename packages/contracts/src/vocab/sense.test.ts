import { describe, expect, it } from 'vitest'

import {
  SENSE_ENTRIES,
  SENSE_TYPES,
  getSenseEntry,
  getSenseLabel,
  senseSchema,
  senseTypeSchema,
} from './sense'

describe('senseTypeSchema', () => {
  it('accepts every known sense type', () => {
    for (const type of SENSE_TYPES) {
      expect(senseTypeSchema.parse(type)).toBe(type)
    }
  })

  it('rejects unknown sense types', () => {
    expect(senseTypeSchema.safeParse('echolocation').success).toBe(false)
  })
})

describe('senseSchema', () => {
  it('accepts a sense with range', () => {
    expect(senseSchema.parse({ type: 'darkvision', range: 60 })).toEqual({
      type: 'darkvision',
      range: 60,
    })
  })
})

describe('sense vocabulary', () => {
  it('derives SENSE_TYPES from the entry map', () => {
    expect([...SENSE_TYPES].sort()).toEqual(Object.keys(SENSE_ENTRIES).sort())
  })

  it('has a label and description for every sense type', () => {
    for (const type of SENSE_TYPES) {
      const entry = getSenseEntry(type)
      expect(entry?.label).toBeTruthy()
      expect(entry?.description).toBeTruthy()
    }
  })

  it('returns labels and falls back for unknown ids', () => {
    expect(getSenseLabel('darkvision')).toBe('Darkvision')
    expect(getSenseLabel('custom')).toBe('custom')
  })
})
