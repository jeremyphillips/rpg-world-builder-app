import { describe, expect, it } from 'vitest'

import { RESOURCE_ICONS, resourceIcon } from './resource-icons.map'

describe('resourceIcon', () => {
  it('returns the canonical glyph for each resource role', () => {
    expect(resourceIcon('currency')).toBe('coins')
    expect(resourceIcon('magicItem')).toBe('gem')
    expect(RESOURCE_ICONS.currency).toBe('coins')
  })
})
