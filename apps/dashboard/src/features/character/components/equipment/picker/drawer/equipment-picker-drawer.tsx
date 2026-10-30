import * as React from 'react'

import {
  catalogNounFromContentType,
  formatChoiceSetDrawerHeading,
  formatEquipmentLoadoutPickerHeading,
} from '@rpg/contracts'
import { Icon, resourceIcon, SegmentedControl, type ResourceIconRole } from '@rpg/ui'

import { CatalogEntityPickerSheet } from '@/features/content'
import { CatalogSortControl } from '../../../picker/sort/catalog-sort-control'
import { CatalogToolbarResetSlot } from '../../../picker/catalog-toolbar-reset-action'
import {
  hasCatalogPickerResetViewCriteria,
  resolveCatalogPickerResultSummary,
} from '../../../picker/catalog-picker-filter-state.lib'
import {
  EQUIPMENT_PICKER_VIEW_DEFAULTS,
  resolveEquipmentPickerDrawerItemHeaderPresentation,
} from './equipment-picker-drawer.lib'
import {
  EquipmentPickerFilterRowControls,
  EquipmentPickerPrimaryFilterControls,
} from '../browse/equipment-picker-filter-controls'
import type { EquipmentPickerRowActionViewModel } from '../equipment-picker-action.lib'
import {
  EQUIPMENT_PICKER_SORT_AXES,
  EQUIPMENT_PICKER_SORT_LABEL,
  EQUIPMENT_PICKER_SORT_PRESETS,
  type EquipmentPickerAcquisitionDrawerProps,
  type EquipmentPickerDrawerProps,
  type EquipmentPickerItem,
  type EquipmentPickerSelectionDrawerProps,
} from './equipment-picker-drawer.types'
import { EquipmentResourceSummary } from '../../acquisition/equipment-resource-summary'
import { resolveEquipmentPickerHeaderResource } from './equipment-picker-header-resource.lib'
import { EquipmentPickerItemDetails } from '../details/equipment-picker-item-details'
import { EquipmentPickerDisclosureRow } from '../browse/equipment-picker-disclosure-row'
import { getEquipmentOwnership } from '../../../../lib/equipment/equipment-ownership-index.lib'
import { useEquipmentPickerController } from './use-equipment-picker-controller'
import { resolveVisibleEquipmentPickerWorkflowSwitcher } from './equipment-picker-workflow-switcher.lib'
import type { EquipmentPickerWorkflowMode } from '../../../../lib/equipment/equipment-step.lib'

const equipmentNoun = catalogNounFromContentType('equipment')
const EQUIPMENT_PICKER_WORKFLOW_GROUP_LABEL = `${equipmentNoun.label} picker workflow`
const EQUIPMENT_PICKER_DESCRIPTION = 'Search the catalog and add items to your loadout.'
export const EQUIPMENT_PICKER_LOADOUT_DESCRIPTION =
  "Search the catalog and add items to this creature's equipment."
const EQUIPMENT_PICKER_MODE_LABELS = {
  purchase: 'Purchase',
  magic_items: 'Magic items',
  loadout: 'Loadout',
} as const satisfies Record<EquipmentPickerWorkflowMode, string>

const EQUIPMENT_PICKER_MODE_ICON_ROLES = {
  purchase: 'currency',
  magic_items: 'magicItem',
} as const satisfies Record<'purchase' | 'magic_items', ResourceIconRole>

export type {
  EquipmentPickerAcquisitionDrawerProps,
  EquipmentPickerDrawerProps,
  EquipmentPickerSelectionDrawerProps,
  EquipmentPickerWorkflowSwitcher,
} from './equipment-picker-drawer.types'

function isEquipmentPickerSelectionDrawer(
  props: EquipmentPickerDrawerProps,
): props is EquipmentPickerSelectionDrawerProps {
  return props.selection != null
}

function EquipmentPickerToolbarActions({
  sortMode,
  structuredFilterCount,
  searchQuery,
  visibleItemCount,
  eligibleItemCount,
  onResetView,
}: {
  sortMode: ReturnType<typeof useEquipmentPickerController>['sortMode']
  structuredFilterCount: number
  searchQuery: string
  visibleItemCount: number
  eligibleItemCount: number
  onResetView: () => void
}) {
  const showResetView = hasCatalogPickerResetViewCriteria({
    structuredFilterCount,
    searchQuery,
    sortMode,
    defaultSortMode: EQUIPMENT_PICKER_VIEW_DEFAULTS.sortMode,
  })

  return (
    <CatalogToolbarResetSlot
      visible={showResetView}
      includesSort
      {...resolveCatalogPickerResultSummary({
        visible: visibleItemCount,
        total: eligibleItemCount,
      })}
      onClick={onResetView}
    />
  )
}

/** Equipment catalog drawer — domain composition over `CatalogEntityPickerSheet`. */
// fallow-ignore-next-line complexity
export function EquipmentPickerDrawer(props: EquipmentPickerDrawerProps) {
  const selection = isEquipmentPickerSelectionDrawer(props) ? props.selection : undefined
  const acquisition: EquipmentPickerAcquisitionDrawerProps | undefined =
    isEquipmentPickerSelectionDrawer(props) ? undefined : props
  const {
    open,
    onOpenChange,
    title,
    description,
    items,
    browseSortContext,
    budget,
    allowedKinds,
    showCharacterPreview = false,
    characterPreviewContext,
    armorClassRules,
    ownership,
    workflowMode = 'purchase',
    workflowSwitcher,
    magicItemGrantProgress,
    magicItemAllowances,
    focusedAllowanceId,
    onFocusedAllowanceIdChange,
    matchesMagicItemAllowance,
    isGoldShoppingPath = false,
    resolveRowActionViewModel,
    footer,
  } = props
  const onCommitAdd = acquisition?.onCommitAdd
  const onSetPurchasedQuantity = acquisition?.onSetPurchasedQuantity
  const onSetRowQuantity = acquisition?.onSetRowQuantity
  const onReleaseChoice = acquisition?.onReleaseChoice
  const onRemovePurchaseOne = acquisition?.onRemovePurchaseOne
  const setRowQuantity = onSetRowQuantity ?? onSetPurchasedQuantity
  const resolvedTitle =
    title ??
    (workflowMode === 'loadout'
      ? formatEquipmentLoadoutPickerHeading()
      : formatChoiceSetDrawerHeading('equipment'))
  const resolvedDescription =
    description ??
    (workflowMode === 'loadout'
      ? EQUIPMENT_PICKER_LOADOUT_DESCRIPTION
      : EQUIPMENT_PICKER_DESCRIPTION)
  const picker = useEquipmentPickerController({
    items,
    browseSortContext,
    budget,
    allowedKinds,
    workflowMode,
    magicItemGrantProgress,
    focusedAllowanceId,
    onFocusedAllowanceIdChange,
    matchesMagicItemAllowance,
    ...(onCommitAdd ? { onCommitAdd } : {}),
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
  const visibleSwitcher = resolveVisibleEquipmentPickerWorkflowSwitcher({
    workflowMode,
    workflowSwitcher,
  })
  const workflowSegment = visibleSwitcher ? (
    <SegmentedControl
      value={workflowMode}
      onValueChange={(value) => visibleSwitcher.onChange(value as EquipmentPickerWorkflowMode)}
      options={visibleSwitcher.modes.map((mode) => {
        const iconRole = mode === 'loadout' ? 'currency' : EQUIPMENT_PICKER_MODE_ICON_ROLES[mode]
        return {
          value: mode,
          label: EQUIPMENT_PICKER_MODE_LABELS[mode],
          leadingIcon: <Icon name={resourceIcon(iconRole)} size="sm" />,
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
      title={
        typeof resolvedTitle === 'string' ? resolvedTitle : formatEquipmentLoadoutPickerHeading()
      }
      description={
        typeof resolvedDescription === 'string'
          ? resolvedDescription
          : EQUIPMENT_PICKER_LOADOUT_DESCRIPTION
      }
      items={picker.filteredItems}
      getItemKey={(item) => item.equipment.id}
      getItemToolbarLabel={(item) => item.equipment.name}
      hasStructuredFilters={picker.structuredFilterCount > 0}
      headerExtra={
        workflowSegment || resourceSummary ? (
          <div className="flex flex-col gap-4">
            {workflowSegment}
            {resourceSummary}
          </div>
        ) : undefined
      }
      transformVisibleItems={picker.transformVisibleItems}
      primaryControls={
        <EquipmentPickerPrimaryFilterControls
          schema={picker.filterSchema}
          layout={picker.filterLayout}
          filterState={picker.filterState}
          items={picker.schemaArgs.items}
          onFilterStateChange={picker.handleFilterStateChange}
        />
      }
      actions={({ searchQuery, resetSearchQuery, visibleItemCount }) => {
        const handleResetView = () => {
          picker.resetBrowseView()
          resetSearchQuery()
        }

        return (
          <EquipmentPickerToolbarActions
            sortMode={picker.sortMode}
            structuredFilterCount={picker.structuredFilterCount}
            searchQuery={searchQuery}
            visibleItemCount={visibleItemCount}
            eligibleItemCount={picker.eligibleItemCount}
            onResetView={handleResetView}
          />
        )
      }}
      filterRow={{
        controls: (
          <EquipmentPickerFilterRowControls
            schema={picker.filterSchema}
            layout={picker.filterLayout}
            filterState={picker.filterState}
            items={picker.schemaArgs.items}
            onFilterStateChange={picker.handleFilterStateChange}
          />
        ),
        actions: (
          <CatalogSortControl
            value={picker.sortMode}
            label={EQUIPMENT_PICKER_SORT_LABEL}
            axes={EQUIPMENT_PICKER_SORT_AXES}
            presets={EQUIPMENT_PICKER_SORT_PRESETS}
            availableValues={picker.effectiveSortModes}
            onValueChange={(value) => picker.setSortMode(value as typeof picker.sortMode)}
          />
        ),
      }}
      selection={selection}
      footer={footer}
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
          armorClassRules: armorClassRules ?? characterPreviewContext?.armorClassRules,
        })
        const commitHeader = picker.handleHeaderCommit

        return (
          <EquipmentPickerDisclosureRow
            rowArgs={rowArgs}
            presentation={presentation}
            workflowMode={workflowMode}
            isGoldShoppingPath={isGoldShoppingPath}
            budget={picker.effectiveBudget}
            armorClassRules={armorClassRules ?? characterPreviewContext?.armorClassRules}
            {...(selection || !commitHeader
              ? {}
              : {
                  onCommitAdd: () => commitHeader(item),
                  ...(setRowQuantity
                    ? { onSetPurchasedQuantity: (total: number) => setRowQuantity(item, total) }
                    : {}),
                  ...(onReleaseChoice
                    ? {
                        onReleaseChoice: (allowanceId: string) =>
                          onReleaseChoice(item, allowanceId),
                      }
                    : {}),
                  ...(onRemovePurchaseOne
                    ? { onRemovePurchaseOne: () => onRemovePurchaseOne(item) }
                    : {}),
                })}
          />
        )
      }}
      {...(selection
        ? {}
        : {
            renderItemDetails: (item: EquipmentPickerItem) => (
              <EquipmentPickerItemDetails
                equipment={item.equipment}
                itemState={item.state}
                budget={picker.effectiveBudget}
                ownership={getEquipmentOwnership(ownership, item.equipment.id)}
                showCharacterPreview={showCharacterPreview}
                characterPreviewContext={characterPreviewContext}
                armorClassRules={armorClassRules ?? characterPreviewContext?.armorClassRules}
              />
            ),
          })}
    />
  )
}
