import { describe, expect, it } from 'vitest'

import { buildCultureContextFields, getConventionCultureId } from './resolve-naming-cultures'

describe('resolve naming cultures', () => {
  it('returns the same id for cultures without a resolver', () => {
    expect(getConventionCultureId('dwarf')).toBe('dwarf')
    expect(getConventionCultureId('elven')).toBe('elven')
  })

  it('builds naming context fields for a selected culture', () => {
    expect(buildCultureContextFields('elven')).toEqual({
      cultureIds: ['elven'],
      conventionCultureIds: ['elven'],
      cultureResolutions: { elven: 'elven' },
    })
  })
})
