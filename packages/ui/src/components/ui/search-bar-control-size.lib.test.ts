import { describe, expect, it } from 'vitest'

import { DEFAULT_FORM_DENSITY } from '../../form/form-density'
import {
  resolveSearchBarControlSize,
  searchBarControlHeightClass,
} from './search-bar-control-size.lib'

describe('resolveSearchBarControlSize', () => {
  it('prefers explicit size over filter and form density', () => {
    expect(
      resolveSearchBarControlSize({
        explicitSize: 'lg',
        filterDensity: 'compact',
        formDensity: 'compact',
      }),
    ).toBe('lg')
  })

  it('prefers filter density over form density when explicit size is omitted', () => {
    expect(
      resolveSearchBarControlSize({
        filterDensity: 'comfortable',
        formDensity: 'compact',
      }),
    ).toBe('md')
    expect(
      resolveSearchBarControlSize({
        filterDensity: 'compact',
        formDensity: 'comfortable',
      }),
    ).toBe('sm')
  })

  it('falls back to form density when filter chrome is absent', () => {
    expect(
      resolveSearchBarControlSize({
        formDensity: 'compact',
      }),
    ).toBe('sm')
    expect(
      resolveSearchBarControlSize({
        formDensity: DEFAULT_FORM_DENSITY,
      }),
    ).toBe('md')
  })
})

describe('searchBarControlHeightClass', () => {
  it('maps size tokens to field height utilities', () => {
    expect(searchBarControlHeightClass('sm')).toContain('h-8')
    expect(searchBarControlHeightClass('md')).toContain('h-9')
    expect(searchBarControlHeightClass('lg')).toContain('h-11')
  })
})
