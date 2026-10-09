import * as React from 'react'

import { applyFilterSchema, useSanitizedFilterState } from '@rpg/ui/filters'

import {
  filterAndSortEquipmentPickerItems,
  filterEligibleEquipmentPickerItems,
  resolveEquipmentKindFilterOptions,
  EQUIPMENT_PICKER_VIEW_DEFAULTS,
} from './equipment-picker-drawer.lib'
import {
  countEquipmentPickerStructuredFilters,
  createEquipmentPickerFilterSchema,
  resolveEquipmentPickerFilterLayout,
  toEquipmentPickerFilterState,
} from '../browse/equipment-picker-filter-schema'
import {
  EMPTY_ARMOR_DETAIL_FILTERS,
  EMPTY_WEAPON_DETAIL_FILTERS,
} from '../browse/equipment-picker-kind-detail-filters'
import {
  EQUIPMENT_PICKER_MODE_MAGIC_ITEMS,
  EQUIPMENT_PICKER_RARITY_ALL,
  EQUIPMENT_PICKER_SORT_MODES,
  EQUIPMENT_PICKER_SORT_PRICE_ASC,
  EQUIPMENT_PICKER_SORT_PRICE_DESC,
  type EquipmentPickerDrawerProps,
  type EquipmentPickerItem,
  type EquipmentPickerRow,
  type EquipmentPickerKindFilter,
  type EquipmentPickerSortMode,
} from './equipment-picker-drawer.types'

export type UseEquipmentPickerControllerArgs = Pick<
  EquipmentPickerDrawerProps,
  | 'items'
  | 'browseSortContext'
  | 'budget'
  | 'allowedKinds'
  | 'workflowMode'
  | 'magicItemGrantProgress'
  | 'focusedAllowanceId'
  | 'onFocusedAllowanceIdChange'
  | 'matchesMagicItemAllowance'
> & {
  onCommitAdd: EquipmentPickerDrawerProps['onCommitAdd']
}

export function useEquipmentPickerController({
  items,
  browseSortContext,
  budget,
  allowedKinds,
  workflowMode = 'purchase',
  magicItemGrantProgress,
  focusedAllowanceId,
  onFocusedAllowanceIdChange,
  matchesMagicItemAllowance,
  onCommitAdd,
}: UseEquipmentPickerControllerArgs) {
  const isMagicItemsWorkflow = workflowMode === EQUIPMENT_PICKER_MODE_MAGIC_ITEMS
  const effectiveBudget = isMagicItemsWorkflow ? undefined : budget
  const effectiveSortModes = isMagicItemsWorkflow
    ? EQUIPMENT_PICKER_SORT_MODES.filter(
        (mode) =>
          mode !== EQUIPMENT_PICKER_SORT_PRICE_ASC && mode !== EQUIPMENT_PICKER_SORT_PRICE_DESC,
      )
    : EQUIPMENT_PICKER_SORT_MODES

  const supportedItems = React.useMemo(() => filterEligibleEquipmentPickerItems(items), [items])
  const kindOptions = React.useMemo(
    () => resolveEquipmentKindFilterOptions(supportedItems, allowedKinds),
    [allowedKinds, supportedItems],
  )

  const [selectedKind, setSelectedKind] = React.useState<EquipmentPickerKindFilter>(
    EQUIPMENT_PICKER_VIEW_DEFAULTS.selectedKind,
  )
  const [showAffordableOnly, setShowAffordableOnly] = React.useState<boolean>(
    EQUIPMENT_PICKER_VIEW_DEFAULTS.showAffordableOnly,
  )
  const [hideNonProficient, setHideNonProficient] = React.useState(false)
  const [weaponFilters, setWeaponFilters] = React.useState(EMPTY_WEAPON_DETAIL_FILTERS)
  const [armorFilters, setArmorFilters] = React.useState(EMPTY_ARMOR_DETAIL_FILTERS)
  const [sortMode, setSortMode] = React.useState<EquipmentPickerSortMode>(
    EQUIPMENT_PICKER_VIEW_DEFAULTS.sortMode,
  )
  const showRarityFilter =
    isMagicItemsWorkflow &&
    magicItemGrantProgress !== undefined &&
    magicItemGrantProgress.length > 1
  const selectedRarityFilter = focusedAllowanceId ?? EQUIPMENT_PICKER_RARITY_ALL
  const showCategoryFilter = kindOptions.length > 1
  const showAffordableFilter = Boolean(effectiveBudget)

  const filterState = React.useMemo(
    () =>
      toEquipmentPickerFilterState({
        selectedKind,
        selectedRarity: selectedRarityFilter,
        showAffordableOnly,
        hideNonProficient,
        weaponFilters,
        armorFilters,
      }),
    [
      armorFilters,
      hideNonProficient,
      selectedKind,
      selectedRarityFilter,
      showAffordableOnly,
      weaponFilters,
    ],
  )

  const schemaArgs = React.useMemo(
    () => ({
      workflowMode,
      items: supportedItems,
      kindOptions,
      showCategoryFilter,
      showRarityFilter,
      showAffordableFilter,
      magicItemGrantProgress,
      budget: effectiveBudget,
      matchesMagicItemAllowance,
    }),
    [
      effectiveBudget,
      kindOptions,
      magicItemGrantProgress,
      matchesMagicItemAllowance,
      showAffordableFilter,
      showCategoryFilter,
      showRarityFilter,
      supportedItems,
      workflowMode,
    ],
  )

  const filterSchema = React.useMemo(
    () => createEquipmentPickerFilterSchema<EquipmentPickerRow>(schemaArgs),
    [schemaArgs],
  )

  const filterLayout = React.useMemo(
    () => resolveEquipmentPickerFilterLayout(filterSchema),
    [filterSchema],
  )

  const structuredFilterCount = countEquipmentPickerStructuredFilters(filterSchema, filterState)

  const handleFilterStateChange = React.useCallback(
    (next: typeof filterState) => {
      if (next.selectedKind !== undefined) {
        setSelectedKind(next.selectedKind)
      }
      if (next.selectedRarity !== undefined) {
        onFocusedAllowanceIdChange?.(
          next.selectedRarity === EQUIPMENT_PICKER_RARITY_ALL ? undefined : next.selectedRarity,
        )
      }
      setShowAffordableOnly(next.showAffordableOnly === true)
      setHideNonProficient(next.hideNonProficient === true)
      setWeaponFilters(next.weaponFilters ?? EMPTY_WEAPON_DETAIL_FILTERS)
      setArmorFilters(next.armorFilters ?? EMPTY_ARMOR_DETAIL_FILTERS)
    },
    [onFocusedAllowanceIdChange],
  )

  useSanitizedFilterState({
    schema: filterSchema,
    state: filterState,
    onStateChange: handleFilterStateChange,
  })

  const eligibleItems = supportedItems

  const filteredItems = React.useMemo(
    () => applyFilterSchema(filterSchema, filterState, eligibleItems),
    [eligibleItems, filterSchema, filterState],
  )

  const transformVisibleItems = React.useCallback(
    (visibleItems: readonly EquipmentPickerRow[], context: { searchQuery: string }) =>
      filterAndSortEquipmentPickerItems(visibleItems, {
        searchQuery: context.searchQuery,
        sortMode,
        browseSortContext: {
          preferMartialWeaponBrowseOrder:
            browseSortContext?.preferMartialWeaponBrowseOrder ?? false,
          ...browseSortContext,
          rankPurchaseAvailability: workflowMode === 'purchase',
          rankCompatibility: browseSortContext?.rankCompatibility ?? true,
        },
      }),
    [browseSortContext, sortMode, workflowMode],
  )

  const resetBrowseView = React.useCallback(() => {
    setSelectedKind(EQUIPMENT_PICKER_VIEW_DEFAULTS.selectedKind)
    setShowAffordableOnly(EQUIPMENT_PICKER_VIEW_DEFAULTS.showAffordableOnly)
    setHideNonProficient(false)
    setWeaponFilters(EMPTY_WEAPON_DETAIL_FILTERS)
    setArmorFilters(EMPTY_ARMOR_DETAIL_FILTERS)
    setSortMode(EQUIPMENT_PICKER_VIEW_DEFAULTS.sortMode)
    onFocusedAllowanceIdChange?.(undefined)
  }, [onFocusedAllowanceIdChange])

  const handleHeaderCommit = React.useCallback(
    (item: EquipmentPickerItem): boolean => onCommitAdd(item) !== false,
    [onCommitAdd],
  )

  return {
    isMagicItemsWorkflow,
    effectiveBudget,
    effectiveSortModes,
    schemaArgs,
    filterState,
    filterSchema,
    filterLayout,
    structuredFilterCount,
    filteredItems,
    eligibleItemCount: eligibleItems.length,
    transformVisibleItems,
    selectedKind,
    showAffordableOnly,
    sortMode,
    setSortMode,
    handleFilterStateChange,
    resetBrowseView,
    handleHeaderCommit,
  }
}
