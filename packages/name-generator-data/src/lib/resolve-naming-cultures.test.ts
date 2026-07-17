import { describe, expect, it } from 'vitest'

import { buildCultureContextFields, getConventionCultureId } from './resolve-naming-cultures'

describe('resolve naming cultures', () => {
  it('maps heritage cultures to elven-general conventions', () => {
    expect(getConventionCultureId('high-elf')).toBe('elven-general')
    expect(getConventionCultureId('wood-elf')).toBe('elven-general')
    expect(getConventionCultureId('drow')).toBe('elven-general')
  })

  it('returns the same id for cultures without a resolver', () => {
    expect(getConventionCultureId('mountain-dwarf')).toBe('mountain-dwarf')
  })

  it('builds naming context fields for heritage selection', () => {
    expect(buildCultureContextFields('drow')).toEqual({
      cultureIds: ['drow'],
      conventionCultureIds: ['elven-general'],
      cultureResolutions: { drow: 'elven-general' },
      heritageIds: ['drow'],
    })
  })
})
