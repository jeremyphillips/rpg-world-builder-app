import { describe, expect, it } from 'vitest'

import { MAGIC_ITEM_RARITIES, MAGIC_ITEM_RARITY_ENTRIES, magicItemRaritySchema } from './rarity'

describe('magicItemRaritySchema', () => {
  it('matches MAGIC_ITEM_RARITIES', () => {
    expect(magicItemRaritySchema.options).toEqual([...MAGIC_ITEM_RARITIES])
  })

  it('has a non-empty label for every rarity', () => {
    for (const rarity of MAGIC_ITEM_RARITIES) {
      expect(MAGIC_ITEM_RARITY_ENTRIES[rarity].label.length).toBeGreaterThan(0)
    }
  })
})
