import type { CatalogPickerCollapsibleRowRenderArgs } from '@rpg/ui'

import {
  buildEquipmentPickerRowViewModel,
  CatalogEntityRow,
  CatalogMetadataRenderer,
  type EntitySummaryProvenanceItem,
} from '@/features/content'
import { useEquipmentAcquisitionQuantityCommit } from '../../../../hooks/use-equipment-acquisition-quantity-commit'
import { resolvePickerMutationCopy } from '../../../../lib/picker/picker-mutation-family'
import { resolvePickerSelectionStateLine } from '../../../../lib/picker/picker-selection-state'
import { mapEquipmentCompactSummaryToMetadataLines } from '../map-equipment-compact-summary-to-metadata-lines'
import { resolveEquipmentSelectionRowPresentation } from '../../../../lib/equipment/equipment-selection-row-presentation.lib'
import type { EquipmentPickerWorkflowMode } from '../../../../lib/equipment/equipment-step.lib'
import {
  resolveSelectionRowStatusItems,
  type SelectionRowStatusTooltip,
} from '../../../../lib/selection-row-status'
import { EquipmentPickerRowAcquisitionControl } from './equipment-picker-row-acquisition-control'
import { getEquipmentUnaffordableAmounts } from '../drawer/equipment-picker-drawer.lib'
import type {
  EquipmentBudgetSummary,
  EquipmentPickerItem,
} from '../drawer/equipment-picker-drawer.types'
import { EquipmentUnaffordableAffordanceTooltip } from '../status/equipment-unaffordable-affordance-tooltip'
import type {
  EquipmentPickerItemPresentation,
  EquipmentPickerProvenanceSegment,
} from './equipment-picker-item-header.lib'

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
  workflowMode?: EquipmentPickerWorkflowMode
  isGoldShoppingPath?: boolean
  budget?: EquipmentBudgetSummary
  onCommitAdd?: () => boolean
  onSetPurchasedQuantity?: (total: number) => void
  onReleaseChoice?: (allowanceId: string) => void
  onRemovePurchaseOne?: () => void
}

export function EquipmentPickerDisclosureRow({
  rowArgs,
  presentation,
  workflowMode = 'purchase',
  isGoldShoppingPath = false,
  budget,
  onCommitAdd,
  onSetPurchasedQuantity,
  onReleaseChoice,
  onRemovePurchaseOne,
}: EquipmentPickerDisclosureRowProps) {
  const { isPending, commitFailed, commitQuantity } = useEquipmentAcquisitionQuantityCommit({
    commit: () => onCommitAdd?.() ?? false,
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

  const toProvenanceItem = (
    segment: EquipmentPickerProvenanceSegment,
  ): EntitySummaryProvenanceItem => {
    if (segment.kind === 'text') return { kind: 'text', label: segment.label }
    return {
      kind: 'action',
      key: segment.key,
      label: segment.label,
      ariaLabel: segment.ariaLabel,
      onAction: () => {
        if (segment.target.kind === 'release_choice') onReleaseChoice?.(segment.target.allowanceId)
        else onRemovePurchaseOne?.()
      },
    }
  }

  const provenance = presentation.provenance.map(toProvenanceItem)
  const selectionState = resolvePickerSelectionStateLine(presentation.selectionState)

  const trailing =
    presentation.control.kind === 'none' && !presentation.priceSlot
      ? undefined
      : {
          kind: 'group' as const,
          primary: (
            <EquipmentPickerRowAcquisitionControl
              control={presentation.control}
              equipmentName={row.name}
              addLabel={resolvePickerMutationCopy('genericSelection').acquire}
              isPending={isPending}
              commitFailed={commitFailed}
              onAdd={() => commitQuantity(1)}
              onSetPurchasedQuantity={(total) => onSetPurchasedQuantity?.(total)}
              onRelease={(allowanceId) => onReleaseChoice?.(allowanceId)}
              onRemovePurchase={() => onRemovePurchaseOne?.()}
            />
          ),
          ...(presentation.priceSlot ? { secondary: presentation.priceSlot } : {}),
        }

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
        ...(workflowMode === 'magic_items' ? {} : { classification: row.kindLabel }),
        description: (
          <CatalogMetadataRenderer
            density="compact"
            lines={mapEquipmentCompactSummaryToMetadataLines({
              kindLabel: row.kindLabel,
              comparisonGroups: row.comparisonGroups,
            })}
          />
        ),
        ...(selectionState ? { selectionState } : {}),
        ...(status.length > 0 ? { status } : {}),
        ...(provenance.length > 0 ? { provenance } : {}),
        statusComposition: 'metadata',
      }}
      trailing={trailing}
    />
  )
}
