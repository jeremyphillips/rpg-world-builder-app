import * as React from 'react'

import { catalogNounFromContentType, formatChoiceSetDrawerHeading } from '@rpg/contracts'
import { resourceIcon, SegmentedControl, type ResourceIconRole } from '@rpg/ui'

import { CatalogEntityPickerSheet } from '@/features/content'
import { CatalogSortControl } from '../../../picker/sort/catalog-sort-control'
import { pickerSortOption } from '../../../picker/sort/catalog-picker-sort-labels.lib'
import { CatalogToolbarResetSlot } from '../../../picker/catalog-toolbar-reset-action'
import {
  getEquipmentPickerSearchText,
  hasEquipmentPickerResetViewCriteria,
  resolveEquipmentPickerDrawerItemHeaderPresentation,
} from './equipment-picker-drawer.lib'
import {
  EquipmentPickerFilterRowControls,
  EquipmentPickerPrimaryFilterControls,
} from '../browse/equipment-picker-filter-controls'
import type { EquipmentPickerRowActionViewModel } from '../equipment-picker-action.lib'
import {
  EQUIPMENT_PICKER_SORT_GROUP_LABEL,
  EQUIPMENT_PICKER_SORT_LABEL,
  EQUIPMENT_PICKER_SORT_LABELS,
  EQUIPMENT_PICKER_SORT_ORDER_LABEL,
  type EquipmentPickerDrawerProps,
  type EquipmentPickerItem,
} from './equipment-picker-drawer.types'
import { EquipmentResourceSummary } from '../../acquisition/equipment-resource-summary'
import { resolveEquipmentPickerHeaderResource } from './equipment-picker-header-resource.lib'
import { equipmentPickerHeaderExtraStackClasses } from './equipment-picker-drawer.variants'
import { EquipmentPickerItemDetails } from '../details/equipment-picker-item-details'
import { EquipmentPickerDisclosureRow } from '../browse/equipment-picker-disclosure-row'
import { getEquipmentOwnership } from '../../../../lib/equipment/equipment-ownership-index.lib'
import { useEquipmentPickerController } from './use-equipment-picker-controller'
import type { EquipmentPickerWorkflowMode } from '../../../../lib/equipment/equipment-step.lib'

const equipmentNoun = catalogNounFromContentType('equipment')
const EQUIPMENT_PICKER_WORKFLOW_GROUP_LABEL = `${equipmentNoun.label} picker workflow`
const EQUIPMENT_PICKER_DESCRIPTION = 'Search the catalog and add items to your loadout.'
const EQUIPMENT_PICKER_MODE_LABELS = {
  purchase: 'Purchase',
  magic_items: 'Magic items',
} as const satisfies Record<EquipmentPickerWorkflowMode, string>

const EQUIPMENT_PICKER_MODE_ICON_ROLES = {
  purchase: 'currency',
  magic_items: 'magicItem',
} as const satisfies Record<EquipmentPickerWorkflowMode, ResourceIconRole>

export type { EquipmentPickerDrawerProps } from './equipment-picker-drawer.types'

function EquipmentPickerToolbarActions({
  selectedKind,
  showAffordableOnly,
  sortMode,
  searchQuery,
  focusedAllowanceId,
  workflowMode,
  onResetView,
}: {
  selectedKind: ReturnType<typeof useEquipmentPickerController>['selectedKind']
  showAffordableOnly: boolean
  sortMode: ReturnType<typeof useEquipmentPickerController>['sortMode']
  searchQuery: string
  focusedAllowanceId?: string
  workflowMode: EquipmentPickerWorkflowMode
  onResetView: () => void
}) {
  const showResetView = hasEquipmentPickerResetViewCriteria({
    selectedKind,
    showAffordableOnly,
    focusedAllowanceId,
    workflowMode,
    searchQuery,
    sortMode,
  })

  return <CatalogToolbarResetSlot visible={showResetView} includesSort onClick={onResetView} />
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
  ownership,
  workflowMode = 'purchase',
  workflowModes = ['purchase'],
  onWorkflowModeChange,
  magicItemGrantProgress,
  magicItemAllowances,
  focusedAllowanceId,
  onFocusedAllowanceIdChange,
  isGoldShoppingPath = false,
  resolveRowActionViewModel,
  onCommitAdd,
  onSetPurchasedQuantity,
  onReleaseChoice,
  onRemovePurchaseOne,
}: EquipmentPickerDrawerProps) {
  const picker = useEquipmentPickerController({
    items,
    browseSortContext,
    budget,
    allowedKinds,
    filterOutUnaffordable,
    filterOutNonProficient,
    workflowMode,
    magicItemGrantProgress,
    focusedAllowanceId,
    onFocusedAllowanceIdChange,
    onCommitAdd,
  })

  const headerResource = resolveEquipmentPickerHeaderResource({
    workflowMode,
    budget,
    magicItemAllowances,
    magicItemGrantProgress,
  })
  const resourceSummary =
    headerResource?.kind === 'currency' ? (
      <EquipmentResourceSummary density="compact" currency={headerResource.currency} />
    ) : headerResource?.kind === 'magicItems' ? (
      <EquipmentResourceSummary density="compact" slots={headerResource.slots} />
    ) : null
  const workflowSegment =
    workflowModes.length === 2 && onWorkflowModeChange ? (
      <SegmentedControl
        value={workflowMode}
        onValueChange={(value) => onWorkflowModeChange(value as EquipmentPickerWorkflowMode)}
        options={workflowModes.map((mode) => {
          const Icon = resourceIcon(EQUIPMENT_PICKER_MODE_ICON_ROLES[mode])
          return {
            value: mode,
            label: EQUIPMENT_PICKER_MODE_LABELS[mode],
            leadingIcon: <Icon />,
          }
        })}
        aria-label={EQUIPMENT_PICKER_WORKFLOW_GROUP_LABEL}
        fullWidth
      />
    ) : null

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
      title={formatChoiceSetDrawerHeading('equipment')}
      description={EQUIPMENT_PICKER_DESCRIPTION}
      items={picker.filteredItems}
      getItemKey={(item) => item.equipment.id}
      getItemToolbarLabel={(item) => item.equipment.name}
      getSearchText={(item) => getEquipmentPickerSearchText(item)}
      hasStructuredFilters={picker.structuredFilterCount > 0}
      headerExtra={
        workflowSegment || resourceSummary ? (
          <div className={equipmentPickerHeaderExtraStackClasses}>
            {workflowSegment}
            {resourceSummary}
          </div>
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

        return (
          <EquipmentPickerToolbarActions
            selectedKind={picker.selectedKind}
            showAffordableOnly={picker.showAffordableOnly}
            sortMode={picker.sortMode}
            searchQuery={searchQuery}
            focusedAllowanceId={focusedAllowanceId}
            workflowMode={workflowMode}
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
            ariaLabel={EQUIPMENT_PICKER_SORT_GROUP_LABEL}
            triggerAriaLabel={EQUIPMENT_PICKER_SORT_ORDER_LABEL}
            options={picker.effectiveSortModes.map((mode) =>
              pickerSortOption(mode, EQUIPMENT_PICKER_SORT_LABELS[mode]),
            )}
            onValueChange={(value) => picker.setSortMode(value as typeof picker.sortMode)}
          />
        ),
      }}
      renderEntityRow={(rowArgs) => {
        const item = rowArgs.item
        const itemOwnership = getEquipmentOwnership(ownership, item.equipment.id)
        const presentation = resolveEquipmentPickerDrawerItemHeaderPresentation({
          item,
          workflowMode,
          ownership: itemOwnership,
          rowActionVm: resolveRowVm(item, 1),
          budget: picker.effectiveBudget,
          magicItemGrantProgress,
        })

        return (
          <EquipmentPickerDisclosureRow
            rowArgs={rowArgs}
            presentation={presentation}
            workflowMode={workflowMode}
            isGoldShoppingPath={isGoldShoppingPath}
            budget={picker.effectiveBudget}
            onCommitAdd={() => picker.handleHeaderCommit(item)}
            onSetPurchasedQuantity={(total) => onSetPurchasedQuantity?.(item, total)}
            onReleaseChoice={(allowanceId) => onReleaseChoice?.(item, allowanceId)}
            onRemovePurchaseOne={() => onRemovePurchaseOne?.(item)}
          />
        )
      }}
      renderItemDetails={(item) => (
        <EquipmentPickerItemDetails
          equipment={item.equipment}
          itemState={item.state}
          budget={picker.effectiveBudget}
          ownership={getEquipmentOwnership(ownership, item.equipment.id)}
          showCharacterPreview={showCharacterPreview}
          characterPreviewContext={characterPreviewContext}
        />
      )}
    />
  )
}
