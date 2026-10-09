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
  type FilterCatalogLayoutConfig,
  type FilterSchema,
} from '@rpg/ui/filters'

import type { EquipmentPickerWorkflowMode } from '../../../../lib/equipment/equipment-step.lib'
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
  items: readonly EquipmentPickerRow[]
  kindOptions: readonly EquipmentPickerSupportedKind[]
  showCategoryFilter: boolean
  showRarityFilter: boolean
  showAffordableFilter: boolean
  magicItemGrantProgress?: readonly MagicItemGrantProgress[]
  matchesMagicItemAllowance?: (row: EquipmentPickerItem, allowanceId: string) => boolean
  filterOutUnaffordable: boolean
  filterOutNonProficient: boolean
  searchQuery: string
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
  return {
    ...sanitizeEquipmentPickerKindSelection(args, state),
    ...sanitizeEquipmentPickerRaritySelection(args, state),
    ...sanitizeEquipmentPickerAffordableSelection(args, state),
  }
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
}): EquipmentPickerFilterState {
  return {
    selectedKind: args.selectedKind,
    selectedRarity: args.selectedRarity,
    showAffordableOnly: args.showAffordableOnly || undefined,
  }
}
