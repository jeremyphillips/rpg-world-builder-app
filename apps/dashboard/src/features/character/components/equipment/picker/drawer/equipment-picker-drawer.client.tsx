'use client'

import * as React from 'react'
import { CircleAlert } from 'lucide-react'

import { EmphasisDetailLine, SegmentedControl, Text } from '@rpg/ui'

import { CatalogEntityPickerSheet } from '@/features/content'
import { formatMoney, formatWealthAsGold } from '@rpg/contracts'

import { formatAddContentTypeLabel, getContentTypeItemLabel } from '@/features/content'
import { CatalogSortControl } from '../../../picker/sort/catalog-sort-control.client'
import { pickerSortOption } from '../../../picker/sort/catalog-picker-sort-labels.lib'
import { CatalogToolbarResetSlot } from '../../../picker/catalog-toolbar-reset-action.client'
import {
  countEquipmentPickerClearableCriteria,
  getEquipmentUnaffordableAmounts,
  getEquipmentPickerSearchText,
  hasEquipmentPickerClearableCriteria,
  hasEquipmentPickerResetViewCriteria,
  resolveEquipmentPickerDrawerItemHeaderPresentation,
} from './equipment-picker-drawer.lib'
import {
  EquipmentPickerFilterRowControls,
  EquipmentPickerPrimaryFilterControls,
} from '../browse/equipment-picker-filter-controls.client'
import type { EquipmentPickerRowActionViewModel } from '../equipment-picker-action.lib'
import {
  EQUIPMENT_PICKER_CLEAR_FILTERS_LABEL,
  EQUIPMENT_PICKER_MODE_LABELS,
  EQUIPMENT_PICKER_RESET_VIEW_LABEL,
  EQUIPMENT_PICKER_SORT_LABEL,
  EQUIPMENT_PICKER_SORT_LABELS,
  type EquipmentPickerDrawerProps,
  type EquipmentPickerItem,
  type EquipmentPickerToolbarResetMode,
} from './equipment-picker-drawer.types'
import { EquipmentBudgetHeader } from '../browse/equipment-budget-header.client'
import { EquipmentPickerItemDetails } from '../details/equipment-picker-item-details.client'
import { EquipmentPickerDisclosureRow } from '../browse/equipment-picker-disclosure-row.client'
import { useEquipmentPickerController } from './use-equipment-picker-controller.client'
import type { EquipmentPickerWorkflowMode } from '../../../../lib/equipment/equipment-step.lib'

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
  selectedKind: ReturnType<typeof useEquipmentPickerController>['selectedKind']
  showAffordableOnly: boolean
  sortMode: ReturnType<typeof useEquipmentPickerController>['sortMode']
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
        secondaryTone="disabled"
      />
    </Text>
  )
}

/** Equipment catalog drawer — domain composition over `CatalogEntityPickerSheet`. */
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
  workflowMode = 'purchase',
  workflowModes = ['purchase'],
  onWorkflowModeChange,
  magicItemGrantProgress,
  focusedAllowanceId,
  onFocusedAllowanceIdChange,
  toolbarResetMode = 'reset_view',
  isGoldShoppingPath = false,
  resolveRowActionViewModel,
  resolveGrantManageSources,
  grantAcquisitionContext,
  onCommitAdd,
  onApplyMagicItemAcquisition,
  onReleaseGrant,
  onRemovePurchase,
  onRemoveFromInventory,
  onRemoveOneFromInventory,
}: EquipmentPickerDrawerProps) {
  const picker = useEquipmentPickerController({
    open,
    items,
    browseSortContext,
    budget,
    allowedKinds,
    filterOutUnaffordable,
    filterOutNonProficient,
    ownedPurchaseQuantities,
    ownedGrantQuantities,
    workflowMode,
    magicItemGrantProgress,
    focusedAllowanceId,
    onFocusedAllowanceIdChange,
    onCommitAdd,
  })

  const showWorkflowSegment = workflowModes.length === 2

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

  return (
    <CatalogEntityPickerSheet
      open={open}
      onOpenChange={onOpenChange}
      title={formatAddContentTypeLabel('equipment')}
      description="Search the catalog and add items to your loadout."
      items={picker.filteredItems}
      getItemKey={(item) => item.equipment.id}
      getItemToolbarLabel={(item) => item.equipment.name}
      getSearchText={(item) => getEquipmentPickerSearchText(item)}
      hasStructuredFilters={picker.structuredFilterCount > 0}
      headerExtra={
        showWorkflowSegment && onWorkflowModeChange ? (
          <SegmentedControl
            value={workflowMode}
            onValueChange={(value) => onWorkflowModeChange(value as EquipmentPickerWorkflowMode)}
            options={workflowModes.map((mode) => ({
              value: mode,
              label: EQUIPMENT_PICKER_MODE_LABELS[mode],
            }))}
            aria-label={`${getContentTypeItemLabel('equipment')} picker workflow`}
            fullWidth
          />
        ) : picker.effectiveBudget ? (
          <EquipmentBudgetHeader budget={picker.effectiveBudget} />
        ) : undefined
      }
      transformVisibleItems={picker.transformVisibleItems}
      primaryControls={
        <EquipmentPickerPrimaryFilterControls
          schemaArgs={picker.schemaArgs}
          filterState={picker.filterState}
          onFilterStateChange={picker.handleFilterStateChange}
        />
      }
      actions={({ searchQuery, resetSearchQuery }) => {
        const handleResetView = () => {
          picker.resetBrowseView()
          resetSearchQuery()
        }

        const handleClearFilters = () => {
          resetSearchQuery()
          picker.handleClearStructuredFilters()
        }

        return (
          <EquipmentPickerToolbarActions
            toolbarResetMode={toolbarResetMode}
            selectedKind={picker.selectedKind}
            showAffordableOnly={picker.showAffordableOnly}
            sortMode={picker.sortMode}
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
          <EquipmentPickerFilterRowControls
            schemaArgs={{ ...picker.schemaArgs, searchQuery }}
            filterState={picker.filterState}
            onFilterStateChange={picker.handleFilterStateChange}
          />
        ),
        actions: (
          <CatalogSortControl
            value={picker.sortMode}
            label={EQUIPMENT_PICKER_SORT_LABEL}
            ariaLabel="Sort equipment"
            triggerAriaLabel="Equipment sort order"
            options={picker.effectiveSortModes.map((mode) =>
              pickerSortOption(mode, EQUIPMENT_PICKER_SORT_LABELS[mode]),
            )}
            onValueChange={(value) => picker.setSortMode(value as typeof picker.sortMode)}
          />
        ),
      }}
      renderEntityRow={(rowArgs) => {
        const item = rowArgs.item
        const rowActionVm = resolveRowVm(item, 1)
        const ownedQuantity = picker.resolveOwnedQuantity(item, workflowMode)
        const presentation = resolveEquipmentPickerDrawerItemHeaderPresentation({
          item,
          workflowMode,
          ownedQuantity,
          rowActionVm,
          budget: picker.effectiveBudget,
        })
        const canQuickAdd = presentation.action.kind === 'add' && !presentation.action.disabled

        return (
          <EquipmentPickerDisclosureRow
            rowArgs={rowArgs}
            presentation={presentation}
            ownedQuantity={ownedQuantity}
            isGoldShoppingPath={isGoldShoppingPath}
            onCommit={canQuickAdd ? () => picker.handleHeaderCommit(item) : undefined}
          />
        )
      }}
      renderItemSummary={(item) =>
        picker.isMagicItemsWorkflow ? null : (
          <EquipmentPickerRowSummary item={item} budget={picker.effectiveBudget} />
        )
      }
      renderItemDetails={(item) => {
        const addQuantity = picker.addQuantities[item.equipment.id] ?? 1
        const rowActionVm = resolveRowVm(item, addQuantity)
        const manageSources = resolveGrantManageSources?.(item.equipment.id) ?? {
          grants: [],
          purchases: [],
        }
        const ownedQuantity = picker.resolveOwnedQuantity(item, workflowMode)

        return (
          <EquipmentPickerItemDetails
            equipment={item.equipment}
            itemState={item.state}
            budget={picker.effectiveBudget}
            ownedQuantity={ownedQuantity}
            addQuantity={addQuantity}
            onAddQuantityChange={(quantity) =>
              picker.handleAddQuantityChange(item.equipment.id, quantity)
            }
            onCommit={() => picker.handleCommitAdd(item)}
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
            grantAcquisitionContext={grantAcquisitionContext}
            onApplyMagicItemAcquisition={
              onApplyMagicItemAcquisition
                ? (requestedQuantity) =>
                    onApplyMagicItemAcquisition({
                      equipmentId: item.equipment.id,
                      requestedQuantity,
                    })
                : undefined
            }
            onReleaseGrant={onReleaseGrant}
            onRemovePurchase={onRemovePurchase}
          />
        )
      }}
    />
  )
}
