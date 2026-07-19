import { describe, expect, it } from 'vitest'

import { buildCatalogDisclosureLabel } from './catalog-disclosure-label.lib'

describe('buildCatalogDisclosureLabel', () => {
  it('includes source label when provided', () => {
    expect(
      buildCatalogDisclosureLabel({ name: 'Dagger', sourceLabel: 'Purchased with starting gold' }),
    ).toBe('Dagger, Purchased with starting gold')
  })

  it('falls back to entry index when source is absent', () => {
    expect(buildCatalogDisclosureLabel({ name: 'Dagger', entryIndex: 1 })).toBe('Dagger, entry 2')
  })

  it('returns the name alone when no source context exists', () => {
    expect(buildCatalogDisclosureLabel({ name: 'Dagger' })).toBe('Dagger')
  })
})
