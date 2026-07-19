import { describe, expect, it } from 'vitest'

import type { Equipment } from '@rpg/contracts'

import {
  equipmentPickerChainMailFixture,
  equipmentPickerLongswordFixture,
} from '../../components/equipment/equipment-picker-drawer.fixtures'
import {
  buildCharacterDetailEquipmentKindChipOptions,
  CHARACTER_DETAIL_EQUIPMENT_KIND_ALL,
  CHARACTER_DETAIL_EQUIPMENT_SORT_NAME_DESC,
  filterCharacterDetailEquipmentCards,
  resolveCharacterDetailEquipmentKindOptions,
  sortCharacterDetailEquipmentCards,
} from './character-detail-equipment-filters.lib'
import type { CharacterSheetEquipmentCard } from './character-sheet-catalog'

function resolvedEquipmentCard(equipment: Equipment, id: string): CharacterSheetEquipmentCard {
  return {
    id,
    displayName: equipment.name,
    referenceId: equipment.id,
    bucket: 'weapons',
    quantity: 1,
    equipped: false,
    sources: [{ label: 'Manual' }],
    status: 'resolved',
    equipment,
    entry: {
      equipmentId: equipment.id,
      quantity: 1,
      sources: [{ kind: 'manual' }],
    },
  }
}

describe('character-detail-equipment-filters.lib', () => {
  const weaponCard = resolvedEquipmentCard(equipmentPickerLongswordFixture, 'weapon-1')
  const armorCard = resolvedEquipmentCard(equipmentPickerChainMailFixture, 'armor-1')

  it('derives kind options from resolved cards only', () => {
    expect(resolveCharacterDetailEquipmentKindOptions([weaponCard, armorCard])).toEqual([
      'weapon',
      'armor',
    ])
  })

  it('builds category chips with an All sentinel', () => {
    expect(buildCharacterDetailEquipmentKindChipOptions(['weapon', 'armor'])).toEqual([
      { value: CHARACTER_DETAIL_EQUIPMENT_KIND_ALL, label: 'All' },
      { value: 'weapon', label: 'Weapon' },
      { value: 'armor', label: 'Armor' },
    ])
  })

  it('filters cards by kind and search query', () => {
    const filtered = filterCharacterDetailEquipmentCards([weaponCard, armorCard], {
      selectedKind: 'weapon',
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
