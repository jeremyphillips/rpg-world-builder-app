'use client'

import * as React from 'react'
import { CircleAlert } from 'lucide-react'

import {
  CatalogFilterChips,
  CatalogPickerSheet,
  EmphasisDetailLine,
  SegmentedControl,
  Text,
} from '@rpg/ui'
import {
  formatMoney,
  formatWealthAsGold,
  getEquipmentKindLabel,
  getMagicItemRarityLabel,
  isEquipmentPickerSupportedKind,
  isEquipmentStackable,
} from '@rpg/contracts'

import { CatalogPickerFilterCheckbox } from '../picker/catalog-picker-filter-checkbox.client'
import { catalogPickerShellProps } from '../picker/catalog-picker-shell.lib'
import { CatalogSortControl } from '../picker/catalog-sort-control.client'
import { pickerSortOption } from '../picker/catalog-picker-sort-labels.lib'
import { CatalogToolbarResetSlot } from '../picker/catalog-toolbar-reset-action.client'
import {
  countEquipmentPickerAffordableHiddenImpact,
  countEquipmentPickerClearableCriteria,
  countEquipmentPickerStructuredFilters,
  EQUIPMENT_PICKER_VIEW_DEFAULTS,
  filterAndSortEquipmentPickerItems,
  filterEquipmentPickerItems,
  getEquipmentUnaffordableAmounts,
  hasEquipmentPickerClearableCriteria,
  hasEquipmentPickerResetViewCriteria,
  resolveEquipmentKindFilterOptions,
  resolveEquipmentPickerDrawerItemHeaderPresentation,
} from './equipment-picker-drawer.lib'
import type { EquipmentPickerRowActionViewModel } from './equipment-picker-action.lib'
import {
  EQUIPMENT_PICKER_AFFORDABLE_NOW_LABEL,
  EQUIPMENT_PICKER_CATEGORY_LABEL,
  EQUIPMENT_PICKER_CLEAR_FILTERS_LABEL,
  EQUIPMENT_PICKER_KIND_ALL,
  EQUIPMENT_PICKER_MODE_LABELS,
  EQUIPMENT_PICKER_MODE_MAGIC_ITEMS,
  EQUIPMENT_PICKER_MODE_PURCHASE,
  EQUIPMENT_PICKER_RARITY_ALL,
  EQUIPMENT_PICKER_RARITY_LABEL,
  EQUIPMENT_PICKER_RESET_VIEW_LABEL,
  EQUIPMENT_PICKER_SORT_LABEL,
  EQUIPMENT_PICKER_SORT_LABELS,
  EQUIPMENT_PICKER_SORT_MODES,
  EQUIPMENT_PICKER_SORT_PRICE_ASC,
  EQUIPMENT_PICKER_SORT_PRICE_DESC,
  type EquipmentPickerDrawerProps,
  type EquipmentPickerItem,
  type EquipmentPickerKindFilter,
  type EquipmentPickerSortMode,
  type EquipmentPickerToolbarResetMode,
} from './equipment-picker-drawer.types'
import { EquipmentBudgetHeader } from './equipment-budget-header.client'
import { EquipmentPickerItemDetails } from './equipment-picker-item-details.client'
import { EquipmentPickerItemHeaderRail } from './equipment-picker-item-header-rail.client'
import {
  clampEquipmentStepQuantity,
  resolveEquipmentStepPurchaseMaxQuantity,
} from '../../lib/equipment-quantity.lib'
import {
  resolveEquipmentOwnedQuantity,
  type EquipmentPickerWorkflowMode,
} from '../../lib/equipment-step.lib'

export type { EquipmentPickerDrawerProps } from './equipment-picker-drawer.types'

function EquipmentPickerToolbarActions({
  toolbarResetMode,
  selectedKind,
  showAffordableOnly,
  sortMode,
  searchQuery,
  focusedAllowanceId,
  workflowMode,
  onClearStructuredFilters,
  onResetView,
}: {
  toolbarResetMode: EquipmentPickerToolbarResetMode
  selectedKind: EquipmentPickerKindFilter
  showAffordableOnly: boolean
  sortMode: EquipmentPickerSortMode
  searchQuery: string
  focusedAllowanceId?: string
  workflowMode: EquipmentPickerWorkflowMode
  onClearStructuredFilters: () => void
  onResetView: () => void
}) {
  const structuredFilterArgs = {
    selectedKind,
    showAffordableOnly,
    focusedAllowanceId,
    workflowMode,
  }
  const clearableCriteriaCount = countEquipmentPickerClearableCriteria({
    ...structuredFilterArgs,
    searchQuery,
  })
  const showClearFilters =
    toolbarResetMode === 'clear_filters' &&
    hasEquipmentPickerClearableCriteria(clearableCriteriaCount)
  const showResetView =
    toolbarResetMode === 'reset_view' &&
    hasEquipmentPickerResetViewCriteria({
      ...structuredFilterArgs,
      searchQuery,
      sortMode,
    })

  const handleClearFilters = () => {
    onClearStructuredFilters()
  }

  if (!showClearFilters && !showResetView) {
    return (
      <CatalogToolbarResetSlot
        visible={false}
        label={EQUIPMENT_PICKER_RESET_VIEW_LABEL}
        onClick={() => undefined}
      />
    )
  }

  if (showClearFilters) {
    return (
      <CatalogToolbarResetSlot
        visible
        label={EQUIPMENT_PICKER_CLEAR_FILTERS_LABEL}
        onClick={handleClearFilters}
      />
    )
  }

  return (
    <CatalogToolbarResetSlot
      visible
      label={EQUIPMENT_PICKER_RESET_VIEW_LABEL}
      onClick={onResetView}
    />
  )
}

function EquipmentPickerAffordableFilter({
  showAffordableOnly,
  onShowAffordableOnlyChange,
  showAffordableFilter,
  affordableHiddenCount,
}: {
  showAffordableOnly: boolean
  onShowAffordableOnlyChange: (checked: boolean) => void
  showAffordableFilter: boolean
  affordableHiddenCount: number
}) {
  if (!showAffordableFilter) return null

  return (
    <CatalogPickerFilterCheckbox
      id="equipment-picker-affordable-now"
      label={EQUIPMENT_PICKER_AFFORDABLE_NOW_LABEL}
      checked={showAffordableOnly}
      onCheckedChange={onShowAffordableOnlyChange}
      hiddenCount={showAffordableOnly ? affordableHiddenCount : undefined}
    />
  )
}

function EquipmentPickerRowSummary({
  item,
  budget,
}: {
  item: EquipmentPickerItem
  budget?: EquipmentPickerDrawerProps['budget']
}) {
  const amounts = getEquipmentUnaffordableAmounts(item, budget)
  if (!amounts) return null

  const need = formatMoney(amounts.required)
  const have = formatWealthAsGold(amounts.remaining)

  return (
    <Text as="p" variant="warning" className="flex items-start gap-1.5 text-xs">
      <CircleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden />
      <EmphasisDetailLine
        primary={`${need} needed`}
        secondary={`${have} remaining`}
        secondaryTone="subtle"
      />
    </Text>
  )
}

/** Equipment catalog drawer — thin wrapper over `CatalogPickerSheet`. */
export function EquipmentPickerDrawer({
  open,
  onOpenChange,
  items,
  browseSortContext,
  budget,
  allowedKinds,
  filterOutUnaffordable = false,
  filterOutNonProficient = false,
  showCharacterPreview = false,
  characterPreviewContext,
  ownedPurchaseQuantities = {},
  ownedGrantQuantities = {},
  workflowMode = EQUIPMENT_PICKER_MODE_PURCHASE,
  workflowModes = [EQUIPMENT_PICKER_MODE_PURCHASE],
  onWorkflowModeChange,
  magicItemGrantProgress,
  focusedAllowanceId,
  onFocusedAllowanceIdChange,
  toolbarResetMode = 'reset_view',
  isGoldShoppingPath = false,
  resolveRowActionViewModel,
  resolveGrantManageSources,
  draft,
  context,
  catalogIndex,
  onApplyMagicItemAcquisition,
  onApplyPurchase,
  onReleaseGrant,
  onRemovePurchase,
  onAddItem,
  onRemoveFromInventory,
  onRemoveOneFromInventory,
}: EquipmentPickerDrawerProps) {
  const isMagicItemsWorkflow = workflowMode === EQUIPMENT_PICKER_MODE_MAGIC_ITEMS
  const showWorkflowSegment = workflowModes.length === 2
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
  const [addQuantities, setAddQuantities] = React.useState<Record<string, number>>({})

  // Browse context (category, affordable toggle, sort) preserved across close/reopen.
  // Reset only via explicit Clear filters / Reset view or a future context-key change.
  React.useEffect(() => {
    if (!open) {
      setAddQuantities({})
    }
  }, [open])

  React.useEffect(() => {
    setSelectedKind((current) => {
      if (current === EQUIPMENT_PICKER_KIND_ALL) return current
      return kindOptions.includes(current) ? current : EQUIPMENT_PICKER_KIND_ALL
    })
  }, [kindOptions])

  const structuredFilterCount = countEquipmentPickerStructuredFilters({
    selectedKind,
    showAffordableOnly,
    focusedAllowanceId,
    workflowMode,
  })

  const showRarityFilter =
    isMagicItemsWorkflow &&
    magicItemGrantProgress !== undefined &&
    magicItemGrantProgress.length > 1
  const selectedRarityFilter = focusedAllowanceId ?? EQUIPMENT_PICKER_RARITY_ALL

  const handleSelectedRarityFilterChange = React.useCallback(
    (value: string) => {
      onFocusedAllowanceIdChange?.(value === EQUIPMENT_PICKER_RARITY_ALL ? undefined : value)
    },
    [onFocusedAllowanceIdChange],
  )

  const filteredItems = React.useMemo(
    () =>
      filterEquipmentPickerItems(supportedItems, {
        filterOutUnaffordable,
        filterOutNonProficient,
        selectedKind,
        showAffordableOnly,
      }),
    [
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
        browseSortContext,
        workflowMode,
      }),
    [browseSortContext, sortMode, workflowMode],
  )

  const handleSelectedKindChange = React.useCallback((kind: EquipmentPickerKindFilter) => {
    setSelectedKind(kind)
  }, [])

  const handleClearStructuredFilters = React.useCallback(() => {
    setSelectedKind(EQUIPMENT_PICKER_VIEW_DEFAULTS.selectedKind)
    setShowAffordableOnly(EQUIPMENT_PICKER_VIEW_DEFAULTS.showAffordableOnly)
    onFocusedAllowanceIdChange?.(undefined)
  }, [onFocusedAllowanceIdChange])

  const showCategoryFilter = kindOptions.length > 1

  const handleHeaderCommit = React.useCallback(
    (item: EquipmentPickerItem): boolean => {
      const itemKey = item.equipment.id

      if (isMagicItemsWorkflow && onApplyMagicItemAcquisition) {
        return onApplyMagicItemAcquisition({ equipmentId: itemKey, requestedQuantity: 1 })
      }

      if (!isMagicItemsWorkflow && onApplyPurchase) {
        onApplyPurchase({ equipmentId: itemKey, requestedQuantity: 1 })
        return true
      }

      const ownedQuantity = draft
        ? resolveEquipmentOwnedQuantity({ equipmentId: itemKey, draft })
        : (ownedPurchaseQuantities[itemKey] ?? 0)
      const maxQuantity = resolveEquipmentStepPurchaseMaxQuantity({
        equipment: item.equipment,
        budget: effectiveBudget,
        currentQuantity: ownedQuantity,
      })
      const cappedQuantity = clampEquipmentStepQuantity(1, maxQuantity)
      onAddItem(item, cappedQuantity)
      return true
    },
    [
      draft,
      effectiveBudget,
      isMagicItemsWorkflow,
      onAddItem,
      onApplyMagicItemAcquisition,
      onApplyPurchase,
      ownedPurchaseQuantities,
    ],
  )

  const handleCommitAdd = React.useCallback(
    (item: EquipmentPickerItem) => {
      const itemKey = item.equipment.id
      const quantity = addQuantities[itemKey] ?? 1

      if (isMagicItemsWorkflow && onApplyMagicItemAcquisition) {
        onApplyMagicItemAcquisition({ equipmentId: itemKey, requestedQuantity: quantity })
        if (isEquipmentStackable(item.equipment)) {
          setAddQuantities((current) => ({ ...current, [itemKey]: 1 }))
        }
        return
      }

      if (!isMagicItemsWorkflow && onApplyPurchase) {
        onApplyPurchase({ equipmentId: itemKey, requestedQuantity: quantity })
        if (isEquipmentStackable(item.equipment)) {
          setAddQuantities((current) => ({ ...current, [itemKey]: 1 }))
        }
        return
      }

      const ownedQuantity = draft
        ? resolveEquipmentOwnedQuantity({ equipmentId: itemKey, draft })
        : (ownedPurchaseQuantities[itemKey] ?? 0)
      const maxQuantity = resolveEquipmentStepPurchaseMaxQuantity({
        equipment: item.equipment,
        budget: effectiveBudget,
        currentQuantity: ownedQuantity,
      })
      const cappedQuantity = clampEquipmentStepQuantity(quantity, maxQuantity)
      onAddItem(item, cappedQuantity)
      if (isEquipmentStackable(item.equipment)) {
        setAddQuantities((current) => ({ ...current, [itemKey]: 1 }))
      }
    },
    [
      addQuantities,
      draft,
      effectiveBudget,
      isMagicItemsWorkflow,
      onAddItem,
      onApplyMagicItemAcquisition,
      onApplyPurchase,
      ownedPurchaseQuantities,
    ],
  )

  const resolveRowVm = React.useCallback(
    (
      item: EquipmentPickerItem,
      requestedQuantity: number,
    ): EquipmentPickerRowActionViewModel | undefined => {
      if (!resolveRowActionViewModel) return undefined
      return resolveRowActionViewModel({
        equipment: item.equipment,
        workflowMode,
        requestedQuantity,
      })
    },
    [resolveRowActionViewModel, workflowMode],
  )

  const handleAddQuantityChange = React.useCallback((itemKey: string, quantity: number) => {
    setAddQuantities((current) => ({ ...current, [itemKey]: quantity }))
  }, [])

  return (
    <CatalogPickerSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Add equipment"
      description="Search the catalog and add items to your loadout."
      {...catalogPickerShellProps()}
      items={filteredItems}
      getItemKey={(item) => item.equipment.id}
      getItemToolbarLabel={(item) => item.equipment.name}
      getSearchText={(item) => item.searchText}
      hasStructuredFilters={structuredFilterCount > 0}
      headerExtra={
        showWorkflowSegment && onWorkflowModeChange ? (
          <SegmentedControl
            value={workflowMode}
            onValueChange={(value) => onWorkflowModeChange(value as EquipmentPickerWorkflowMode)}
            options={workflowModes.map((mode) => ({
              value: mode,
              label: EQUIPMENT_PICKER_MODE_LABELS[mode],
            }))}
            aria-label="Equipment picker workflow"
            fullWidth
          />
        ) : effectiveBudget ? (
          <EquipmentBudgetHeader budget={effectiveBudget} />
        ) : undefined
      }
      transformVisibleItems={transformVisibleItems}
      primaryControls={
        showRarityFilter ? (
          <CatalogFilterChips
            id="equipment-picker-rarity"
            label={EQUIPMENT_PICKER_RARITY_LABEL}
            selectionMode="single-required"
            value={selectedRarityFilter}
            onValueChange={handleSelectedRarityFilterChange}
            options={[
              { value: EQUIPMENT_PICKER_RARITY_ALL, label: 'All' },
              ...magicItemGrantProgress.map((entry) => ({
                value: entry.allowanceId,
                label: getMagicItemRarityLabel(entry.rarity),
              })),
            ]}
          />
        ) : showCategoryFilter ? (
          <CatalogFilterChips
            id="equipment-picker-category"
            label={EQUIPMENT_PICKER_CATEGORY_LABEL}
            selectionMode="single-required"
            value={selectedKind}
            onValueChange={(value) => handleSelectedKindChange(value as EquipmentPickerKindFilter)}
            options={[
              { value: EQUIPMENT_PICKER_KIND_ALL, label: 'All' },
              ...kindOptions.map((kind) => ({
                value: kind,
                label: getEquipmentKindLabel(kind),
              })),
            ]}
          />
        ) : undefined
      }
      actions={({ searchQuery, resetSearchQuery }) => {
        const handleResetView = () => {
          setSelectedKind(EQUIPMENT_PICKER_VIEW_DEFAULTS.selectedKind)
          setShowAffordableOnly(EQUIPMENT_PICKER_VIEW_DEFAULTS.showAffordableOnly)
          setSortMode(EQUIPMENT_PICKER_VIEW_DEFAULTS.sortMode)
          onFocusedAllowanceIdChange?.(undefined)
          resetSearchQuery()
        }

        const handleClearFilters = () => {
          resetSearchQuery()
          handleClearStructuredFilters()
        }

        return (
          <EquipmentPickerToolbarActions
            toolbarResetMode={toolbarResetMode}
            selectedKind={selectedKind}
            showAffordableOnly={showAffordableOnly}
            sortMode={sortMode}
            searchQuery={searchQuery}
            focusedAllowanceId={focusedAllowanceId}
            workflowMode={workflowMode}
            onClearStructuredFilters={handleClearFilters}
            onResetView={handleResetView}
          />
        )
      }}
      filterRow={{
        controls: ({ searchQuery }) => (
          <EquipmentPickerAffordableFilter
            showAffordableOnly={showAffordableOnly}
            onShowAffordableOnlyChange={setShowAffordableOnly}
            showAffordableFilter={Boolean(effectiveBudget)}
            affordableHiddenCount={countEquipmentPickerAffordableHiddenImpact(supportedItems, {
              searchQuery,
              filterOutUnaffordable,
              filterOutNonProficient,
              selectedKind,
              showAffordableOnly,
            })}
          />
        ),
        actions: (
          <CatalogSortControl
            value={sortMode}
            label={EQUIPMENT_PICKER_SORT_LABEL}
            ariaLabel="Sort equipment"
            triggerAriaLabel="Equipment sort order"
            options={effectiveSortModes.map((mode) =>
              pickerSortOption(mode, EQUIPMENT_PICKER_SORT_LABELS[mode]),
            )}
            onValueChange={(value) => setSortMode(value as EquipmentPickerSortMode)}
          />
        ),
      }}
      renderItemHeader={(item) => {
        const rowActionVm = resolveRowVm(item, 1)
        const presentation = resolveEquipmentPickerDrawerItemHeaderPresentation({
          item,
          workflowMode,
          draft,
          rowActionVm,
        })
        const ownedQuantity = draft
          ? resolveEquipmentOwnedQuantity({ equipmentId: item.equipment.id, draft })
          : isMagicItemsWorkflow
            ? (ownedGrantQuantities[item.equipment.id] ?? 0)
            : (ownedPurchaseQuantities[item.equipment.id] ?? 0)
        const canQuickAdd = presentation.action.kind === 'add' && !presentation.action.disabled

        return (
          <EquipmentPickerItemHeaderRail
            item={item}
            presentation={presentation}
            ownedQuantity={ownedQuantity}
            isGoldShoppingPath={isGoldShoppingPath}
            onCommit={canQuickAdd ? () => handleHeaderCommit(item) : undefined}
          />
        )
      }}
      renderItemSummary={(item) =>
        isMagicItemsWorkflow ? null : (
          <EquipmentPickerRowSummary item={item} budget={effectiveBudget} />
        )
      }
      renderItemDetails={(item) => {
        const addQuantity = addQuantities[item.equipment.id] ?? 1
        const rowActionVm = resolveRowVm(item, addQuantity)
        const manageSources = resolveGrantManageSources?.(item.equipment.id) ?? {
          grants: [],
          purchases: [],
        }

        return (
          <EquipmentPickerItemDetails
            equipment={item.equipment}
            itemState={item.state}
            budget={effectiveBudget}
            ownedQuantity={
              draft
                ? resolveEquipmentOwnedQuantity({ equipmentId: item.equipment.id, draft })
                : isMagicItemsWorkflow
                  ? (ownedGrantQuantities[item.equipment.id] ?? 0)
                  : (ownedPurchaseQuantities[item.equipment.id] ?? 0)
            }
            addQuantity={addQuantity}
            onAddQuantityChange={(quantity) => handleAddQuantityChange(item.equipment.id, quantity)}
            onCommit={() => handleCommitAdd(item)}
            onRemoveFromInventory={
              onRemoveFromInventory ? () => onRemoveFromInventory(item) : undefined
            }
            onRemoveOneFromInventory={
              onRemoveOneFromInventory ? () => onRemoveOneFromInventory(item) : undefined
            }
            showCharacterPreview={showCharacterPreview}
            characterPreviewContext={characterPreviewContext}
            rowActionVm={rowActionVm}
            manageSources={manageSources}
            draft={draft}
            context={context}
            catalogIndex={catalogIndex}
            onApplyMagicItemAcquisition={(requestedQuantity) =>
              onApplyMagicItemAcquisition?.({
                equipmentId: item.equipment.id,
                requestedQuantity,
              }) ?? false
            }
            onApplyPurchase={(requestedQuantity) =>
              onApplyPurchase?.({ equipmentId: item.equipment.id, requestedQuantity })
            }
            onReleaseGrant={onReleaseGrant}
            onRemovePurchase={onRemovePurchase}
          />
        )
      }}
    />
  )
}
