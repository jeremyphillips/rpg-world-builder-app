import type { MagicItemGrantProgress } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import { sanitizeFilterState } from '@rpg/ui/filters'

import {
  createEquipmentPickerFilterSchema,
  type EquipmentPickerFilterState,
} from './equipment-picker-filter-schema'
import type { EquipmentPickerItem } from './equipment-picker-drawer.types'
import {
  EQUIPMENT_PICKER_KIND_ALL,
  EQUIPMENT_PICKER_RARITY_ALL,
} from './equipment-picker-drawer.types'

const items = [] as unknown as readonly EquipmentPickerItem[]

const magicItemGrantProgress = [
  {
    allowanceId: 'common',
    rarity: 'common',
    capacity: 1,
    selected: 0,
    remainingCapacity: 1,
    isFilled: false,
  },
] satisfies MagicItemGrantProgress[]

describe('equipment-picker-filter-schema', () => {
  it('keeps valid kind and rarity selections unchanged', () => {
    const schema = createEquipmentPickerFilterSchema({
      workflowMode: 'purchase',
      items,
      kindOptions: ['weapon'],
      showCategoryFilter: true,
      showRarityFilter: false,
      showAffordableFilter: true,
      filterOutUnaffordable: false,
      filterOutNonProficient: false,
      searchQuery: '',
    })

    const state: EquipmentPickerFilterState = {
      selectedKind: 'weapon',
      showAffordableOnly: true,
    }

    const sanitized = sanitizeFilterState(schema, state)
    expect(sanitized).toStrictEqual(state)
    expect(sanitized.selectedKind).toBe(state.selectedKind)
  })

  it('resets invalid kind and rarity values when schema shape changes', () => {
    const schema = createEquipmentPickerFilterSchema({
      workflowMode: 'magic_items',
      items,
      kindOptions: ['weapon'],
      showCategoryFilter: false,
      showRarityFilter: true,
      showAffordableFilter: false,
      magicItemGrantProgress,
      filterOutUnaffordable: false,
      filterOutNonProficient: false,
      searchQuery: '',
    })

    const state: EquipmentPickerFilterState = {
      selectedKind: 'armor',
      selectedRarity: 'missing',
      showAffordableOnly: true,
    }

    expect(sanitizeFilterState(schema, state)).toEqual({
      selectedKind: undefined,
      selectedRarity: EQUIPMENT_PICKER_RARITY_ALL,
      showAffordableOnly: undefined,
    })
  })

  it('treats sentinel kind and rarity values as non-constraining', () => {
    const schema = createEquipmentPickerFilterSchema({
      workflowMode: 'purchase',
      items,
      kindOptions: ['weapon'],
      showCategoryFilter: true,
      showRarityFilter: false,
      showAffordableFilter: false,
      filterOutUnaffordable: false,
      filterOutNonProficient: false,
      searchQuery: '',
    })

    const kindField = schema.fields.find((field) => field.id === 'selectedKind')
    expect(kindField?.isValueConstraining?.(EQUIPMENT_PICKER_KIND_ALL)).toBe(false)
  })
})
