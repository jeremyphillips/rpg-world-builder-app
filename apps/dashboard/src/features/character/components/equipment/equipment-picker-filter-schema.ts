import {
  getEquipmentKindLabel,
  getMagicItemRarityLabel,
  type MagicItemGrantProgress,
} from '@rpg/contracts'

import {
  countModifiedFilters,
  createBooleanFilter,
  createChipsFilter,
  createFilterSchema,
  type FilterCatalogLayoutConfig,
  type FilterSchema,
} from '@rpg/ui/filters'

import type { EquipmentPickerWorkflowMode } from '../../lib/equipment-step.lib'
import type { EquipmentPickerItem } from './equipment-picker-drawer.types'
import {
  EQUIPMENT_PICKER_AFFORDABLE_NOW_LABEL,
  EQUIPMENT_PICKER_CATEGORY_LABEL,
  EQUIPMENT_PICKER_KIND_ALL,
  EQUIPMENT_PICKER_RARITY_ALL,
  EQUIPMENT_PICKER_RARITY_LABEL,
  type EquipmentPickerKindFilter,
  type EquipmentPickerSupportedKind,
} from './equipment-picker-drawer.types'
import { countEquipmentPickerAffordableHiddenImpact } from './equipment-picker-drawer.lib'

export type EquipmentPickerFilterState = {
  selectedKind?: EquipmentPickerKindFilter
  selectedRarity?: string
  showAffordableOnly?: boolean
}

export const EQUIPMENT_PICKER_PRIMARY_FILTER_FIELD_ORDER = [
  'selectedKind',
  'selectedRarity',
] as const satisfies readonly (keyof EquipmentPickerFilterState)[]

export const EQUIPMENT_PICKER_FILTER_ROW_FIELD_ORDER = [
  'showAffordableOnly',
] as const satisfies readonly (keyof EquipmentPickerFilterState)[]

/** @deprecated Use `resolveEquipmentPickerFilterLayout` for schema-aware layout slots. */
export const EQUIPMENT_PICKER_FILTER_LAYOUT = {
  primaryFieldIds: [...EQUIPMENT_PICKER_PRIMARY_FILTER_FIELD_ORDER],
  filterRowFieldIds: [...EQUIPMENT_PICKER_FILTER_ROW_FIELD_ORDER],
} as const satisfies FilterCatalogLayoutConfig<EquipmentPickerFilterState>

export function resolveEquipmentPickerFilterLayout(
  schema: FilterSchema<EquipmentPickerItem, EquipmentPickerFilterState>,
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
  items: readonly EquipmentPickerItem[]
  kindOptions: readonly EquipmentPickerSupportedKind[]
  showCategoryFilter: boolean
  showRarityFilter: boolean
  showAffordableFilter: boolean
  magicItemGrantProgress?: readonly MagicItemGrantProgress[]
  affordableHiddenCount?: number
  filterOutUnaffordable: boolean
  filterOutNonProficient: boolean
  searchQuery: string
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
  return {
    ...sanitizeEquipmentPickerKindSelection(args, state),
    ...sanitizeEquipmentPickerRaritySelection(args, state),
    ...sanitizeEquipmentPickerAffordableSelection(args, state),
  }
}

export function createEquipmentPickerFilterSchema(
  args: CreateEquipmentPickerFilterSchemaArgs,
): FilterSchema<EquipmentPickerItem, EquipmentPickerFilterState> {
  const fields = []

  if (args.showRarityFilter && args.magicItemGrantProgress) {
    fields.push(
      createChipsFilter<EquipmentPickerItem, EquipmentPickerFilterState, 'selectedRarity'>({
        id: 'selectedRarity',
        label: EQUIPMENT_PICKER_RARITY_LABEL,
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
        matches: () => true,
      }),
    )
  } else if (args.showCategoryFilter) {
    fields.push(
      createChipsFilter<EquipmentPickerItem, EquipmentPickerFilterState, 'selectedKind'>({
        id: 'selectedKind',
        label: EQUIPMENT_PICKER_CATEGORY_LABEL,
        selectionMode: 'single-required',
        defaultValue: EQUIPMENT_PICKER_KIND_ALL,
        isValueConstraining: (value) => value !== EQUIPMENT_PICKER_KIND_ALL,
        options: [
          { value: EQUIPMENT_PICKER_KIND_ALL, label: 'All' },
          ...args.kindOptions.map((kind) => ({
            value: kind,
            label: getEquipmentKindLabel(kind),
          })),
        ],
        matches: (row, value) =>
          value === EQUIPMENT_PICKER_KIND_ALL || row.equipment.kind === value,
      }),
    )
  }

  if (args.showAffordableFilter) {
    fields.push(
      createBooleanFilter<EquipmentPickerItem, EquipmentPickerFilterState, 'showAffordableOnly'>({
        id: 'showAffordableOnly',
        label: EQUIPMENT_PICKER_AFFORDABLE_NOW_LABEL,
        placement: 'primary',
        hiddenCount: (state) =>
          state.showAffordableOnly
            ? countEquipmentPickerAffordableHiddenImpact(args.items, {
                searchQuery: args.searchQuery,
                filterOutUnaffordable: args.filterOutUnaffordable,
                filterOutNonProficient: args.filterOutNonProficient,
                selectedKind: state.selectedKind ?? EQUIPMENT_PICKER_KIND_ALL,
                showAffordableOnly: true,
              })
            : undefined,
        getValue: (row) => row.state.isWithinRemainingBudget,
      }),
    )
  }

  return createFilterSchema(fields, {
    sanitizeState: (state) => sanitizeEquipmentPickerFilterState(args, state),
  })
}

export function countEquipmentPickerStructuredFilters(
  schema: FilterSchema<EquipmentPickerItem, EquipmentPickerFilterState>,
  state: EquipmentPickerFilterState,
): number {
  return countModifiedFilters(schema, state)
}

export function toEquipmentPickerFilterState(args: {
  selectedKind: EquipmentPickerKindFilter
  selectedRarity: string
  showAffordableOnly: boolean
}): EquipmentPickerFilterState {
  return {
    selectedKind: args.selectedKind,
    selectedRarity: args.selectedRarity,
    showAffordableOnly: args.showAffordableOnly || undefined,
  }
}
