import type { CatalogPickerCollapsibleRowRenderArgs } from '@rpg/ui'

import {
  buildEquipmentPickerRowViewModel,
  CatalogEntityRow,
  CatalogMetadataRenderer,
} from '@/features/content'
import { useEquipmentAcquisitionQuantityCommit } from '../../../../hooks/use-equipment-acquisition-quantity-commit'
import { resolveAcquisitionCommitButtonLabel } from '../../acquisition/equipment-acquisition-commit-labels.lib'
import { mapEquipmentCompactSummaryToMetadataLines } from '../map-equipment-compact-summary-to-metadata-lines'
import { resolveEquipmentSelectionRowPresentation } from '../../../../lib/equipment/equipment-selection-row-presentation.lib'
import {
  resolveSelectionRowStatusItems,
  type SelectionRowStatusTooltip,
} from '../../../../lib/selection-row-status'
import { EquipmentPickerCommerce } from './equipment-picker-commerce'
import { getEquipmentUnaffordableAmounts } from '../drawer/equipment-picker-drawer.lib'
import type {
  EquipmentBudgetSummary,
  EquipmentPickerItem,
} from '../drawer/equipment-picker-drawer.types'
import { EquipmentUnaffordableAffordanceTooltip } from '../status/equipment-unaffordable-affordance-tooltip'
import type { EquipmentPickerItemPresentation } from './equipment-picker-item-header.lib'

const EQUIPMENT_PICKER_ADD_LABEL = 'Add'

function affordabilityTooltip(
  item: EquipmentPickerItem,
  budget: EquipmentBudgetSummary | undefined,
): SelectionRowStatusTooltip {
  return (entry) => {
    if (entry.reason !== 'unaffordable') return undefined
    const amounts = getEquipmentUnaffordableAmounts(item, budget)
    return amounts ? <EquipmentUnaffordableAffordanceTooltip amounts={amounts} /> : undefined
  }
}

export type EquipmentPickerDisclosureRowProps = {
  rowArgs: CatalogPickerCollapsibleRowRenderArgs<EquipmentPickerItem>
  presentation: EquipmentPickerItemPresentation
  ownedQuantity: number
  isGoldShoppingPath?: boolean
  budget?: EquipmentBudgetSummary
  onCommit?: () => boolean
}

export function EquipmentPickerDisclosureRow({
  rowArgs,
  presentation,
  ownedQuantity,
  isGoldShoppingPath = false,
  budget,
  onCommit,
}: EquipmentPickerDisclosureRowProps) {
  const { isPending, successQuantity, commitFailed, commitQuantity } =
    useEquipmentAcquisitionQuantityCommit({
      commit: () => onCommit?.() ?? false,
    })

  const item = rowArgs.item
  const row = buildEquipmentPickerRowViewModel(item.equipment)
  const status = resolveSelectionRowStatusItems(
    resolveEquipmentSelectionRowPresentation({
      equipment: item.equipment,
      resolved: item.state.resolved,
      purchaseAvailability: item.state.purchaseAvailability,
      blockers: presentation.blockers,
      isGoldShoppingPath,
      isProficient: item.state.isProficient,
    }),
    { context: 'picker', statusTooltip: affordabilityTooltip(item, budget) },
  )
  const addButtonLabel = resolveAcquisitionCommitButtonLabel({
    isPending,
    successQuantity,
    primaryActionLabel: EQUIPMENT_PICKER_ADD_LABEL,
  })

  const trailing =
    presentation.action.kind === 'add' ||
    (presentation.action.kind === 'manage_only' && ownedQuantity > 0)
      ? {
          kind: 'group' as const,
          primary: (
            <EquipmentPickerCommerce
              ownedQuantity={ownedQuantity}
              showAdd={presentation.action.kind === 'add'}
              disabled={presentation.action.kind === 'add' ? presentation.action.disabled : false}
              buttonLabel={addButtonLabel}
              isPending={isPending}
              successQuantity={successQuantity}
              commitFailed={commitFailed}
              onAdd={() => commitQuantity(1)}
            />
          ),
          secondary: presentation.secondary,
        }
      : undefined

  return (
    <CatalogEntityRow
      toolbarLabel={rowArgs.toolbarLabel}
      domIds={rowArgs.domIds}
      collapsible={rowArgs.collapsible}
      collapsed={rowArgs.collapsed}
      onToggleCollapse={rowArgs.onToggleCollapse}
      summary={rowArgs.summary}
      details={rowArgs.details}
      entity={{
        heading: row.name,
        classification: row.kindLabel,
        description: (
          <CatalogMetadataRenderer
            density="compact"
            lines={mapEquipmentCompactSummaryToMetadataLines({
              kindLabel: row.kindLabel,
              comparisonGroups: row.comparisonGroups,
            })}
          />
        ),
        status: status.length > 0 ? status : undefined,
        statusComposition: 'metadata',
      }}
      trailing={trailing}
    />
  )
}
