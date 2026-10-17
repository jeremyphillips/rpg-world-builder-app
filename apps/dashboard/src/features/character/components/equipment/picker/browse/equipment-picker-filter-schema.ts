import {
  MAGIC_ITEM_RARITY_TERM,
  getEquipmentKindCollectionLabel,
  getMagicItemRarityLabel,
  getTermCompactLabel,
  type MagicItemGrantProgress,
} from '@rpg/contracts'

import {
  countModifiedFilters,
  createBooleanFilter,
  createChipsFilter,
  createFilterSchema,
  createPopoverFilter,
  type FilterCatalogLayoutConfig,
  type FilterSchema,
} from '@rpg/ui/filters'

import type { EquipmentPickerWorkflowMode } from '../../../../lib/equipment/equipment-step.lib'
import {
  armorDetailFilterGroups,
  countEquipmentPickerWeaponDetailFilters,
  EMPTY_EQUIPMENT_PICKER_ARMOR_DETAIL_FILTERS,
  EMPTY_EQUIPMENT_PICKER_WEAPON_DETAIL_FILTERS,
  equipmentPickerArmorDetailFiltersActive,
  equipmentPickerKeepsNonProficientHidden,
  EQUIPMENT_PICKER_ARMOR_FILTER_LABEL,
  EQUIPMENT_PICKER_HIDE_NON_PROFICIENT_LABEL,
  EQUIPMENT_PICKER_WEAPON_FILTER_LABEL,
  formatEquipmentPickerDetailFilterTriggerLabel,
  matchesEquipmentPickerArmorDetailFilters,
  matchesEquipmentPickerWeaponDetailFilters,
  shouldShowHideNonProficientFilter,
  weaponDetailFilterGroups,
  equipmentPickerWeaponDetailFiltersActive,
  type EquipmentPickerArmorDetailFilters,
  type EquipmentPickerWeaponDetailFilters,
} from './equipment-picker-detail-filters.lib'
import type {
  EquipmentBudgetSummary,
  EquipmentPickerItem,
  EquipmentPickerRow,
} from '../drawer/equipment-picker-drawer.types'
import {
  EQUIPMENT_PICKER_AFFORDABLE_NOW_LABEL,
  EQUIPMENT_PICKER_CATEGORY_LABEL,
  EQUIPMENT_PICKER_KIND_ALL,
  EQUIPMENT_PICKER_RARITY_ALL,
  type EquipmentPickerKindFilter,
  type EquipmentPickerSupportedKind,
} from '../drawer/equipment-picker-drawer.types'
export type EquipmentPickerFilterState = {
  selectedKind?: EquipmentPickerKindFilter
  selectedRarity?: string
  showAffordableOnly?: boolean
  hideNonProficient?: boolean
  weaponFilters?: EquipmentPickerWeaponDetailFilters
  armorFilters?: EquipmentPickerArmorDetailFilters
}

export const EQUIPMENT_PICKER_PRIMARY_FILTER_FIELD_ORDER = [
  'selectedKind',
  'selectedRarity',
] as const satisfies readonly (keyof EquipmentPickerFilterState)[]

export const EQUIPMENT_PICKER_FILTER_ROW_FIELD_ORDER = [
  'showAffordableOnly',
  'hideNonProficient',
  'weaponFilters',
  'armorFilters',
] as const satisfies readonly (keyof EquipmentPickerFilterState)[]

export function resolveEquipmentPickerFilterLayout<
  TItem extends EquipmentPickerItem = EquipmentPickerItem,
>(
  schema: FilterSchema<TItem, EquipmentPickerFilterState>,
): FilterCatalogLayoutConfig<EquipmentPickerFilterState> {
  const schemaFieldIds = new Set(schema.fields.map((field) => field.id))

  return {
    primaryFieldIds: EQUIPMENT_PICKER_PRIMARY_FILTER_FIELD_ORDER.filter((fieldId) =>
      schemaFieldIds.has(fieldId),
    ),
    filterRowFieldIds: EQUIPMENT_PICKER_FILTER_ROW_FIELD_ORDER.filter((fieldId) =>
      schemaFieldIds.has(fieldId),
    ),
  }
}

export type CreateEquipmentPickerFilterSchemaArgs = {
  workflowMode: EquipmentPickerWorkflowMode
  items: readonly EquipmentPickerRow[]
  kindOptions: readonly EquipmentPickerSupportedKind[]
  showCategoryFilter: boolean
  showRarityFilter: boolean
  showAffordableFilter: boolean
  magicItemGrantProgress?: readonly MagicItemGrantProgress[]
  matchesMagicItemAllowance?: (row: EquipmentPickerItem, allowanceId: string) => boolean
  budget?: EquipmentBudgetSummary
}

function sanitizeEquipmentPickerKindSelection(
  args: CreateEquipmentPickerFilterSchemaArgs,
  state: EquipmentPickerFilterState,
): Partial<EquipmentPickerFilterState> {
  if (args.showCategoryFilter && !args.showRarityFilter) {
    const selectedKind =
      state.selectedKind &&
      args.kindOptions.includes(state.selectedKind as EquipmentPickerSupportedKind)
        ? state.selectedKind
        : EQUIPMENT_PICKER_KIND_ALL

    return { selectedKind }
  }

  return state.selectedKind !== undefined ? { selectedKind: undefined } : {}
}

function sanitizeEquipmentPickerRaritySelection(
  args: CreateEquipmentPickerFilterSchemaArgs,
  state: EquipmentPickerFilterState,
): Partial<EquipmentPickerFilterState> {
  if (args.showRarityFilter && args.magicItemGrantProgress) {
    const validAllowanceIds = args.magicItemGrantProgress.map((entry) => entry.allowanceId)
    const selectedRarity =
      state.selectedRarity && validAllowanceIds.includes(state.selectedRarity)
        ? state.selectedRarity
        : EQUIPMENT_PICKER_RARITY_ALL

    return { selectedRarity }
  }

  return state.selectedRarity !== undefined ? { selectedRarity: undefined } : {}
}

function sanitizeEquipmentPickerAffordableSelection(
  args: CreateEquipmentPickerFilterSchemaArgs,
  state: EquipmentPickerFilterState,
): Partial<EquipmentPickerFilterState> {
  if (!args.showAffordableFilter && state.showAffordableOnly) {
    return { showAffordableOnly: undefined }
  }

  return {}
}

function sanitizeEquipmentPickerFilterState(
  args: CreateEquipmentPickerFilterSchemaArgs,
  state: EquipmentPickerFilterState,
): Partial<EquipmentPickerFilterState> {
  const patch: Partial<EquipmentPickerFilterState> = {
    ...sanitizeEquipmentPickerKindSelection(args, state),
    ...sanitizeEquipmentPickerRaritySelection(args, state),
    ...sanitizeEquipmentPickerAffordableSelection(args, state),
  }
  const selectedKind = patch.selectedKind ?? state.selectedKind
  if (selectedKind !== 'weapon' && state.weaponFilters) patch.weaponFilters = undefined
  if (selectedKind !== 'armor' && state.armorFilters) patch.armorFilters = undefined
  return patch
}

export function createEquipmentPickerFilterSchema<
  TItem extends EquipmentPickerItem = EquipmentPickerItem,
>(args: CreateEquipmentPickerFilterSchemaArgs): FilterSchema<TItem, EquipmentPickerFilterState> {
  const fields = []

  if (args.showRarityFilter && args.magicItemGrantProgress) {
    fields.push(
      createChipsFilter<TItem, EquipmentPickerFilterState, 'selectedRarity'>({
        id: 'selectedRarity',
        label: getTermCompactLabel(MAGIC_ITEM_RARITY_TERM),
        selectionMode: 'single-required',
        defaultValue: EQUIPMENT_PICKER_RARITY_ALL,
        isValueConstraining: (value) => value !== EQUIPMENT_PICKER_RARITY_ALL,
        options: [
          { value: EQUIPMENT_PICKER_RARITY_ALL, label: 'All' },
          ...args.magicItemGrantProgress.map((entry) => ({
            value: entry.allowanceId,
            label: getMagicItemRarityLabel(entry.rarity),
          })),
        ],
        matches: (row, value) => {
          if (typeof value !== 'string') return false
          return (
            args.matchesMagicItemAllowance?.(row, value) ??
            (row.equipment.kind === 'magic_item' &&
              row.equipment.rarity === value.split(':').at(-1))
          )
        },
      }),
    )
  } else if (args.showCategoryFilter) {
    fields.push(
      createChipsFilter<TItem, EquipmentPickerFilterState, 'selectedKind'>({
        id: 'selectedKind',
        label: EQUIPMENT_PICKER_CATEGORY_LABEL,
        selectionMode: 'single-required',
        defaultValue: EQUIPMENT_PICKER_KIND_ALL,
        isValueConstraining: (value) => value !== EQUIPMENT_PICKER_KIND_ALL,
        options: [
          { value: EQUIPMENT_PICKER_KIND_ALL, label: 'All' },
          ...args.kindOptions.map((kind) => ({
            value: kind,
            label: getEquipmentKindCollectionLabel(kind),
          })),
        ],
        matches: (row, value) =>
          value === EQUIPMENT_PICKER_KIND_ALL || row.equipment.kind === value,
      }),
    )
  }

  if (args.showAffordableFilter) {
    fields.push(
      createBooleanFilter<TItem, EquipmentPickerFilterState, 'showAffordableOnly'>({
        id: 'showAffordableOnly',
        label: EQUIPMENT_PICKER_AFFORDABLE_NOW_LABEL,
        placement: 'primary',
        getValue: (row) => row.state.isWithinRemainingBudget,
      }),
    )
  }

  if (shouldShowHideNonProficientFilter(args.items)) {
    fields.push(
      createBooleanFilter<TItem, EquipmentPickerFilterState, 'hideNonProficient'>({
        id: 'hideNonProficient',
        label: EQUIPMENT_PICKER_HIDE_NON_PROFICIENT_LABEL,
        placement: 'primary',
        getValue: (row) => equipmentPickerKeepsNonProficientHidden(row),
      }),
    )
  }

  const weaponGroups = weaponDetailFilterGroups(args.items)
  if (weaponGroups.length > 0) {
    fields.push(
      createPopoverFilter<TItem, EquipmentPickerFilterState, 'weaponFilters'>({
        id: 'weaponFilters',
        label: EQUIPMENT_PICKER_WEAPON_FILTER_LABEL,
        defaultValue: EMPTY_EQUIPMENT_PICKER_WEAPON_DETAIL_FILTERS,
        visible: (state) => state.selectedKind === 'weapon',
        triggerLabel: (activeCount) =>
          formatEquipmentPickerDetailFilterTriggerLabel(
            EQUIPMENT_PICKER_WEAPON_FILTER_LABEL,
            activeCount,
          ),
        groups: weaponGroups,
        isValueConstraining: (value) =>
          equipmentPickerWeaponDetailFiltersActive(
            (value as EquipmentPickerWeaponDetailFilters | undefined) ??
              EMPTY_EQUIPMENT_PICKER_WEAPON_DETAIL_FILTERS,
          ),
        isValueEqual: (left, right) =>
          countEquipmentPickerWeaponDetailFilters(
            (left as EquipmentPickerWeaponDetailFilters | undefined) ??
              EMPTY_EQUIPMENT_PICKER_WEAPON_DETAIL_FILTERS,
          ) ===
            countEquipmentPickerWeaponDetailFilters(
              (right as EquipmentPickerWeaponDetailFilters | undefined) ??
                EMPTY_EQUIPMENT_PICKER_WEAPON_DETAIL_FILTERS,
            ) &&
          JSON.stringify(left ?? EMPTY_EQUIPMENT_PICKER_WEAPON_DETAIL_FILTERS) ===
            JSON.stringify(right ?? EMPTY_EQUIPMENT_PICKER_WEAPON_DETAIL_FILTERS),
        matches: (row, value) =>
          matchesEquipmentPickerWeaponDetailFilters(
            row,
            (value as EquipmentPickerWeaponDetailFilters | undefined) ??
              EMPTY_EQUIPMENT_PICKER_WEAPON_DETAIL_FILTERS,
          ),
      }),
    )
  }

  const armorGroups = armorDetailFilterGroups(args.items)
  if (armorGroups.length > 0) {
    fields.push(
      createPopoverFilter<TItem, EquipmentPickerFilterState, 'armorFilters'>({
        id: 'armorFilters',
        label: EQUIPMENT_PICKER_ARMOR_FILTER_LABEL,
        defaultValue: EMPTY_EQUIPMENT_PICKER_ARMOR_DETAIL_FILTERS,
        visible: (state) => state.selectedKind === 'armor',
        triggerLabel: (activeCount) =>
          formatEquipmentPickerDetailFilterTriggerLabel(
            EQUIPMENT_PICKER_ARMOR_FILTER_LABEL,
            activeCount,
          ),
        groups: armorGroups,
        isValueConstraining: (value) =>
          equipmentPickerArmorDetailFiltersActive(
            (value as EquipmentPickerArmorDetailFilters | undefined) ??
              EMPTY_EQUIPMENT_PICKER_ARMOR_DETAIL_FILTERS,
          ),
        matches: (row, value) =>
          matchesEquipmentPickerArmorDetailFilters(
            row,
            (value as EquipmentPickerArmorDetailFilters | undefined) ??
              EMPTY_EQUIPMENT_PICKER_ARMOR_DETAIL_FILTERS,
          ),
      }),
    )
  }

  return createFilterSchema(fields, {
    sanitizeState: (state) => sanitizeEquipmentPickerFilterState(args, state),
  })
}

export function countEquipmentPickerStructuredFilters<
  TItem extends EquipmentPickerItem = EquipmentPickerItem,
>(
  schema: FilterSchema<TItem, EquipmentPickerFilterState>,
  state: EquipmentPickerFilterState,
): number {
  return countModifiedFilters(schema, state)
}

export function toEquipmentPickerFilterState(args: {
  selectedKind: EquipmentPickerKindFilter
  selectedRarity: string
  showAffordableOnly: boolean
  hideNonProficient?: boolean
  weaponFilters?: EquipmentPickerWeaponDetailFilters
  armorFilters?: EquipmentPickerArmorDetailFilters
}): EquipmentPickerFilterState {
  return {
    selectedKind: args.selectedKind,
    selectedRarity: args.selectedRarity,
    showAffordableOnly: args.showAffordableOnly || undefined,
    hideNonProficient: args.hideNonProficient || undefined,
    weaponFilters: args.weaponFilters,
    armorFilters: args.armorFilters,
  }
}
