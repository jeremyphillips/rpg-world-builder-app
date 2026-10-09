import type { EquipmentPickerItem, MagicItemGrantProgress } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import { applyFilterSchema, sanitizeFilterState } from '@rpg/ui/filters'

import {
  createEquipmentPickerFilterSchema,
  resolveEquipmentPickerFilterLayout,
  type EquipmentPickerFilterState,
} from './equipment-picker-filter-schema'
import type { EquipmentPickerRow } from '../drawer/equipment-picker-drawer.types'
import {
  EQUIPMENT_PICKER_KIND_ALL,
  EQUIPMENT_PICKER_RARITY_ALL,
} from '../drawer/equipment-picker-drawer.types'

const items = [] as unknown as readonly EquipmentPickerRow[]

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
      searchQuery: '',
    })

    const kindField = schema.fields.find((field) => field.id === 'selectedKind')
    expect(kindField?.isValueConstraining?.(EQUIPMENT_PICKER_KIND_ALL)).toBe(false)
  })

  it('resolves layout slots from the active schema fields only', () => {
    const categorySchema = createEquipmentPickerFilterSchema({
      workflowMode: 'purchase',
      items,
      kindOptions: ['weapon'],
      showCategoryFilter: true,
      showRarityFilter: false,
      showAffordableFilter: true,
      filterOutUnaffordable: false,
      searchQuery: '',
    })

    expect(resolveEquipmentPickerFilterLayout(categorySchema)).toEqual({
      primaryFieldIds: ['selectedKind'],
      filterRowFieldIds: ['showAffordableOnly'],
    })

    const raritySchema = createEquipmentPickerFilterSchema({
      workflowMode: 'magic_items',
      items,
      kindOptions: ['weapon'],
      showCategoryFilter: false,
      showRarityFilter: true,
      showAffordableFilter: false,
      magicItemGrantProgress,
      filterOutUnaffordable: false,
      searchQuery: '',
    })

    expect(resolveEquipmentPickerFilterLayout(raritySchema)).toEqual({
      primaryFieldIds: ['selectedRarity'],
      filterRowFieldIds: [],
    })

    const emptySchema = createEquipmentPickerFilterSchema({
      workflowMode: 'purchase',
      items,
      kindOptions: ['weapon'],
      showCategoryFilter: false,
      showRarityFilter: false,
      showAffordableFilter: false,
      filterOutUnaffordable: false,
      searchQuery: '',
    })

    expect(resolveEquipmentPickerFilterLayout(emptySchema)).toEqual({
      primaryFieldIds: [],
      filterRowFieldIds: [],
    })
  })

  it('counts a focused allowance against the whole workflow list', () => {
    const schema = createEquipmentPickerFilterSchema({
      workflowMode: 'magic_items',
      items,
      kindOptions: ['magic_item'],
      showCategoryFilter: false,
      showRarityFilter: true,
      showAffordableFilter: false,
      magicItemGrantProgress,
      matchesMagicItemAllowance: (row, allowanceId) =>
        row.equipment.kind === 'magic_item' && allowanceId === row.equipment.rarity,
      filterOutUnaffordable: false,
      searchQuery: '',
    })
    const rows = [
      { equipment: { kind: 'magic_item', rarity: 'common' } },
      { equipment: { kind: 'magic_item', rarity: 'rare' } },
    ] as EquipmentPickerItem[]

    expect(applyFilterSchema(schema, { selectedRarity: 'common' }, rows)).toEqual([rows[0]])
  })

  it('keeps not-applicable rows when hiding non-proficient equipment', () => {
    const proficient = {
      equipment: { kind: 'weapon', category: 'simple', mode: 'melee', properties: [] },
      state: { resolved: { state: { compatibility: { proficient: true } } } },
    } as unknown as EquipmentPickerItem
    const notApplicable = {
      equipment: { kind: 'gear' },
      state: { resolved: { state: { compatibility: { proficient: undefined } } } },
    } as unknown as EquipmentPickerItem
    const untrained = {
      equipment: { kind: 'weapon', category: 'martial', mode: 'melee', properties: ['heavy'] },
      state: { resolved: { state: { compatibility: { proficient: false } } } },
    } as unknown as EquipmentPickerItem
    const schema = createEquipmentPickerFilterSchema({
      workflowMode: 'purchase',
      items: [proficient, notApplicable, untrained] as unknown as EquipmentPickerRow[],
      kindOptions: ['weapon'],
      showCategoryFilter: false,
      showRarityFilter: false,
      showAffordableFilter: false,
      filterOutUnaffordable: false,
      searchQuery: '',
    })

    expect(
      applyFilterSchema(schema, { hideNonProficient: true }, [
        proficient,
        notApplicable,
        untrained,
      ]),
    ).toEqual([proficient, notApplicable])
  })

  it('keeps armor with no strength requirement when hiding unmet strength', () => {
    const unmet = {
      equipment: { kind: 'armor', category: 'heavy', stealthDisadvantage: true },
      state: {
        resolved: {
          state: { compatibility: { unmetAbilityScoreRequirements: [{ ability: 'str' }] } },
        },
      },
    } as unknown as EquipmentPickerItem
    const noRequirement = {
      equipment: { kind: 'armor', category: 'light', stealthDisadvantage: false },
      state: { resolved: { state: { compatibility: {} } } },
    } as unknown as EquipmentPickerItem
    const schema = createEquipmentPickerFilterSchema({
      workflowMode: 'purchase',
      items: [unmet, noRequirement] as unknown as EquipmentPickerRow[],
      kindOptions: ['armor'],
      showCategoryFilter: true,
      showRarityFilter: false,
      showAffordableFilter: false,
      filterOutUnaffordable: false,
      searchQuery: '',
    })

    expect(
      applyFilterSchema(
        schema,
        {
          selectedKind: 'armor',
          armorFilters: { categories: [], stealth: [], strength: ['hide-unmet-strength'] },
        },
        [unmet, noRequirement],
      ),
    ).toEqual([noRequirement])
  })

  it('drops weapon filters when kind is no longer weapon', () => {
    const schema = createEquipmentPickerFilterSchema({
      workflowMode: 'purchase',
      items: [
        {
          equipment: { kind: 'weapon', category: 'simple', mode: 'melee', properties: [] },
          state: {},
        } as unknown as EquipmentPickerItem,
        {
          equipment: { kind: 'armor', category: 'light', stealthDisadvantage: false },
          state: {},
        } as unknown as EquipmentPickerItem,
      ] as unknown as EquipmentPickerRow[],
      kindOptions: ['weapon', 'armor'],
      showCategoryFilter: true,
      showRarityFilter: false,
      showAffordableFilter: false,
      filterOutUnaffordable: false,
      searchQuery: '',
    })

    expect(
      sanitizeFilterState(schema, {
        selectedKind: 'armor',
        weaponFilters: { categories: ['martial'], modes: [], properties: [] },
      }).weaponFilters,
    ).toBeUndefined()
  })
})
