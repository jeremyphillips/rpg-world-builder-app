import { describe, expect, it } from 'vitest'

import {
  COMPACT_UNSET_PLACEHOLDER,
  resolveFieldPlaceholder,
  resolveFieldSearchPlaceholder,
} from './field-placeholder.lib'

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

describe('resolveFieldSearchPlaceholder', () => {
  it('derives search copy from domain nouns, not action labels', () => {
    expect(
      resolveFieldSearchPlaceholder({
        label: 'Add skill',
        noun: { singular: 'skill', plural: 'skills' },
      }),
    ).toBe('Search skills…')
    expect(
      resolveFieldSearchPlaceholder({
        label: 'Add language',
        noun: { singular: 'language', plural: 'languages' },
      }),
    ).toBe('Search languages…')
  })

  it('falls back to label heuristics for non-action field labels', () => {
    expect(resolveFieldSearchPlaceholder({ label: 'Specific weapons' })).toBe(
      'Search specific weapons…',
    )
  })

  it('documents the incorrect fallback when action labels omit noun metadata', () => {
    expect(resolveFieldSearchPlaceholder({ label: 'Add skill' })).toBe('Search add skill…')
  })

  it('honors explicit search placeholder overrides', () => {
    expect(resolveFieldSearchPlaceholder({ label: 'Add skill' }, 'Search custom…')).toBe(
      'Search custom…',
    )
  })
})
