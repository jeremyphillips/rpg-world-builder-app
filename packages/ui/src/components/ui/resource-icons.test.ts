import { Coins, Gem } from 'lucide-react'
import { describe, expect, it } from 'vitest'

import { RESOURCE_ICONS, resourceIcon } from './resource-icons.map'

describe('resourceIcon', () => {
  it('maps currency and magic items to their glyphs', () => {
    expect(resourceIcon('currency')).toBe(Coins)
    expect(resourceIcon('magicItem')).toBe(Gem)
    expect(RESOURCE_ICONS.currency).toBe(Coins)
    expect(RESOURCE_ICONS.magicItem).toBe(Gem)
  })
})
