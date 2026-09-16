import { describe, expect, it } from 'vitest'

import { COMPACT_UNSET_PLACEHOLDER, resolveFieldPlaceholder } from './field-placeholder.lib'

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

  it('uses compact unset placeholder when digits are set', () => {
    expect(resolveFieldPlaceholder({ label: 'Speed value', category: 'choice', digits: 3 })).toBe(
      COMPACT_UNSET_PLACEHOLDER,
    )
  })

  it('honors presentation default override even when digits are set', () => {
    expect(
      resolveFieldPlaceholder({
        label: 'Score',
        category: 'choice',
        digits: 3,
        presentation: 'default',
      }),
    ).toBe('Choose a score…')
  })

  it('uses compact unset placeholder when presentation is compact without digits', () => {
    expect(
      resolveFieldPlaceholder({
        label: 'Speed value',
        category: 'choice',
        presentation: 'compact',
      }),
    ).toBe(COMPACT_UNSET_PLACEHOLDER)
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
