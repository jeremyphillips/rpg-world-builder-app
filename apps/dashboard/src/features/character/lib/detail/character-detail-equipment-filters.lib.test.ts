import { describe, expect, it } from 'vitest'

import {
  equipmentPickerChainMailFixture,
  equipmentPickerLongswordFixture,
} from '../../components/equipment/picker/equipment-picker-drawer.fixtures'
import { createCharacterDetailEquipmentFilterSchema } from './character-detail-equipment-filter-schema'
import {
  CHARACTER_DETAIL_EQUIPMENT_SORT_NAME_DESC,
  filterCharacterDetailEquipmentCards,
  resolveCharacterDetailEquipmentKindOptions,
  sortCharacterDetailEquipmentCards,
} from './character-detail-equipment-filters.lib'
import { resolvedEquipmentSheetCardFixture } from './character-sheet-catalog.fixtures'

describe('character-detail-equipment-filters.lib', () => {
  const weaponCard = resolvedEquipmentSheetCardFixture(equipmentPickerLongswordFixture, 'weapon-1')
  const armorCard = resolvedEquipmentSheetCardFixture(equipmentPickerChainMailFixture, 'armor-1')

  it('derives kind options from resolved cards only', () => {
    expect(resolveCharacterDetailEquipmentKindOptions([weaponCard, armorCard])).toEqual([
      'weapon',
      'armor',
    ])
  })

  it('filters cards by kind and search query', () => {
    const schema = createCharacterDetailEquipmentFilterSchema({
      kindOptions: ['weapon', 'armor'],
      showCategoryFilter: true,
    })

    const filtered = filterCharacterDetailEquipmentCards([weaponCard, armorCard], {
      schema,
      filterState: { selectedKind: 'weapon' },
      searchQuery: 'long',
    })

    expect(filtered).toEqual([weaponCard])
  })

  it('sorts cards by display name', () => {
    const sorted = sortCharacterDetailEquipmentCards(
      [weaponCard, armorCard],
      CHARACTER_DETAIL_EQUIPMENT_SORT_NAME_DESC,
    )
    expect(sorted.map((card) => card.displayName)).toEqual(['Longsword', 'Chain Mail'])
  })
})
