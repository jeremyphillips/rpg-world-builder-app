import * as React from 'react'

import { useSanitizedFilterState } from '@rpg/ui/filters'
import { isEquipmentPickerSupportedKind } from '@rpg/contracts'

import {
  filterAndSortEquipmentPickerItems,
  filterEquipmentPickerItems,
  resolveEquipmentKindFilterOptions,
  EQUIPMENT_PICKER_VIEW_DEFAULTS,
} from './equipment-picker-drawer.lib'
import {
  countEquipmentPickerStructuredFilters,
  createEquipmentPickerFilterSchema,
  toEquipmentPickerFilterState,
} from '../browse/equipment-picker-filter-schema'
import {
  EQUIPMENT_PICKER_MODE_MAGIC_ITEMS,
  EQUIPMENT_PICKER_RARITY_ALL,
  EQUIPMENT_PICKER_SORT_MODES,
  EQUIPMENT_PICKER_SORT_PRICE_ASC,
  EQUIPMENT_PICKER_SORT_PRICE_DESC,
  type EquipmentPickerDrawerProps,
  type EquipmentPickerItem,
  type EquipmentPickerKindFilter,
  type EquipmentPickerSortMode,
} from './equipment-picker-drawer.types'

export type UseEquipmentPickerControllerArgs = Pick<
  EquipmentPickerDrawerProps,
  | 'items'
  | 'browseSortContext'
  | 'budget'
  | 'allowedKinds'
  | 'filterOutUnaffordable'
  | 'filterOutNonProficient'
  | 'workflowMode'
  | 'magicItemGrantProgress'
  | 'focusedAllowanceId'
  | 'onFocusedAllowanceIdChange'
> & {
  onCommitAdd: EquipmentPickerDrawerProps['onCommitAdd']
}

export function useEquipmentPickerController({
  items,
  browseSortContext,
  budget,
  allowedKinds,
  filterOutUnaffordable = false,
  filterOutNonProficient = false,
  workflowMode = 'purchase',
  magicItemGrantProgress,
  focusedAllowanceId,
  onFocusedAllowanceIdChange,
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

  const supportedItems = React.useMemo(
    () => items.filter((item) => isEquipmentPickerSupportedKind(item.equipment.kind)),
    [items],
  )
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
      }),
    [selectedKind, selectedRarityFilter, showAffordableOnly],
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
      filterOutUnaffordable,
      filterOutNonProficient,
      searchQuery: '',
      budget: effectiveBudget,
    }),
    [
      filterOutNonProficient,
      effectiveBudget,
      filterOutUnaffordable,
      kindOptions,
      magicItemGrantProgress,
      showAffordableFilter,
      showCategoryFilter,
      showRarityFilter,
      supportedItems,
      workflowMode,
    ],
  )

  const filterSchema = React.useMemo(
    () => createEquipmentPickerFilterSchema(schemaArgs),
    [schemaArgs],
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
    },
    [onFocusedAllowanceIdChange],
  )

  useSanitizedFilterState({
    schema: filterSchema,
    state: filterState,
    onStateChange: handleFilterStateChange,
  })

  const filteredItems = React.useMemo(
    () =>
      filterEquipmentPickerItems(supportedItems, {
        filterOutUnaffordable,
        filterOutNonProficient,
        selectedKind,
        showAffordableOnly,
        budget: effectiveBudget,
      }),
    [
      effectiveBudget,
      filterOutNonProficient,
      filterOutUnaffordable,
      showAffordableOnly,
      supportedItems,
      selectedKind,
    ],
  )

  const transformVisibleItems = React.useCallback(
    (visibleItems: readonly EquipmentPickerItem[], context: { searchQuery: string }) =>
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
        workflowMode,
      }),
    [browseSortContext, sortMode, workflowMode],
  )

  const handleClearStructuredFilters = React.useCallback(() => {
    setSelectedKind(EQUIPMENT_PICKER_VIEW_DEFAULTS.selectedKind)
    setShowAffordableOnly(EQUIPMENT_PICKER_VIEW_DEFAULTS.showAffordableOnly)
    onFocusedAllowanceIdChange?.(undefined)
  }, [onFocusedAllowanceIdChange])

  const resetBrowseView = React.useCallback(() => {
    setSelectedKind(EQUIPMENT_PICKER_VIEW_DEFAULTS.selectedKind)
    setShowAffordableOnly(EQUIPMENT_PICKER_VIEW_DEFAULTS.showAffordableOnly)
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
    structuredFilterCount,
    filteredItems,
    transformVisibleItems,
    selectedKind,
    showAffordableOnly,
    sortMode,
    setSortMode,
    handleFilterStateChange,
    handleClearStructuredFilters,
    resetBrowseView,
    handleHeaderCommit,
  }
}
