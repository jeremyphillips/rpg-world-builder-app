import { describe, expect, it } from 'vitest'

import {
  DEFAULT_ARRAY_SECTION_DENSITY,
  DEFAULT_FORM_DENSITY,
  resolveFormDensity,
  resolveSectionDensity,
} from './form-density'

describe('resolveFormDensity', () => {
  it('maps comfortable to gap-6 rhythm and md controls', () => {
    expect(resolveFormDensity('comfortable')).toEqual({ rhythm: 'comfortable', size: 'md' })
  })

  it('maps compact to gap-3 rhythm and sm controls', () => {
    expect(resolveFormDensity('compact')).toEqual({ rhythm: 'compact', size: 'sm' })
  })

  it('defaults to comfortable', () => {
    expect(resolveFormDensity()).toEqual(resolveFormDensity(DEFAULT_FORM_DENSITY))
  })
})

describe('resolveSectionDensity', () => {
  it('prefers explicit density', () => {
    expect(
      resolveSectionDensity({
        explicit: 'compact',
        inherited: 'comfortable',
        sectionDefault: 'comfortable',
      }),
    ).toBe('compact')
  })

  it('falls back to section default then inherited', () => {
    expect(
      resolveSectionDensity({
        inherited: 'comfortable',
        sectionDefault: DEFAULT_ARRAY_SECTION_DENSITY,
      }),
    ).toBe('compact')
  })

  it('inherits parent when no override', () => {
    expect(resolveSectionDensity({ inherited: 'comfortable' })).toBe('comfortable')
  })
})
