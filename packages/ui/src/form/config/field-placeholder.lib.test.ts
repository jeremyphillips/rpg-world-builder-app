import { describe, expect, it } from 'vitest'

import { resolveFieldPlaceholder } from './field-placeholder.lib'

describe('resolveFieldPlaceholder', () => {
  it('defaults single-select placeholders to Choose vocabulary', () => {
    expect(resolveFieldPlaceholder({ label: 'Spellcasting ability', category: 'choice' })).toBe(
      'Choose a spellcasting ability…',
    )
  })

  it('defaults multi-select placeholders to plural Choose vocabulary', () => {
    expect(
      resolveFieldPlaceholder({
        label: 'Primary abilities',
        category: 'multi',
        noun: { singular: 'primary ability', plural: 'primary abilities' },
      }),
    ).toBe('Choose primary abilities…')
  })

  it('respects explicit placeholder overrides', () => {
    expect(resolveFieldPlaceholder({ label: 'Spells', category: 'choice' }, 'Choose spells…')).toBe(
      'Choose spells…',
    )
  })

  it('returns undefined for text-like categories', () => {
    expect(resolveFieldPlaceholder({ label: 'Name', category: 'text' })).toBeUndefined()
  })
})
