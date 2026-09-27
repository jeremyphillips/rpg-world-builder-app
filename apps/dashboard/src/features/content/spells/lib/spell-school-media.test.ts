import { describe, expect, it } from 'vitest'

import { resolveSpellSchoolEntityMedia } from './spell-school-media'

describe('resolveSpellSchoolEntityMedia', () => {
  it('returns spell fallback when school is missing', () => {
    expect(
      resolveSpellSchoolEntityMedia({
        schoolId: undefined,
        vocabulary: { optionById: {} },
        surface: 'detail',
      }),
    ).toEqual({ fallback: 'spell' })
  })

  it('resolves registry emblem for a system spell school', () => {
    const result = resolveSpellSchoolEntityMedia({
      schoolId: 'evocation',
      vocabulary: {
        optionById: {
          evocation: { id: 'evocation', source: 'system', media: undefined },
        },
      },
      rulesetId: 'srd-cc-5.2.1',
      surface: 'detail',
    })

    expect(result.fallback).toBe('spell')
    expect(result.displayImage?.sourceKind).toBe('system')
    expect(result.displayImage?.presentationTreatment).toBe('mono-glyph-invert')
    expect(result.displayImage?.src).toContain('evocation')
  })
})
