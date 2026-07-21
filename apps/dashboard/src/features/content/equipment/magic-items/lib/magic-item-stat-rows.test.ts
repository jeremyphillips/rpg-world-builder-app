import { getVocabularyTermLabel, MAGIC_ITEM_RARITY_TERM } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import { pickEquipment } from '../../../lib/fixtures/pick'
import { getMagicItemStatRows } from './magic-item-stat-rows'

describe('getMagicItemStatRows', () => {
  it('returns rarity, attunement, and category for bracers of defense', () => {
    const bracers = pickEquipment('bracers-of-defense')
    if (bracers.kind !== 'magic_item') throw new Error('expected magic item')

    const rows = getMagicItemStatRows(bracers)
    expect(rows).toEqual([
      { label: getVocabularyTermLabel(MAGIC_ITEM_RARITY_TERM), value: 'Rare' },
      { label: 'Attunement', value: 'Required' },
      { label: 'Category', value: 'Wondrous Item' },
    ])
  })
})
