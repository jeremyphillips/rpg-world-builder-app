'use client'

import type { CatalogPickerCollapsibleRowRenderArgs } from '@rpg/ui'

import {
  buildEquipmentPickerRowViewModel,
  CatalogEntityRow,
  CatalogMetadataRenderer,
} from '@/features/content'
import { useEquipmentAcquisitionQuantityCommit } from '../../../../hooks/use-equipment-acquisition-quantity-commit.client'
import { resolveAcquisitionCommitButtonLabel } from '../../acquisition/equipment-acquisition-commit-labels.lib'
import { mapEquipmentCompactSummaryToMetadataLines } from '../map-equipment-compact-summary-to-metadata-lines'
import { EquipmentPickerCommerce } from './equipment-picker-commerce.client'
import { buildEquipmentPickerEntityStatus } from '../callouts/equipment-picker-callout-presentation.lib'
import { getEquipmentPickerCallout } from '../callouts/equipment-picker-callout.lib'
import type { EquipmentPickerItem } from '../drawer/equipment-picker-drawer.types'
import type { EquipmentPickerItemPresentation } from './equipment-picker-item-header.lib'

const EQUIPMENT_PICKER_ADD_LABEL = 'Add'

export type EquipmentPickerDisclosureRowProps = {
  rowArgs: CatalogPickerCollapsibleRowRenderArgs<EquipmentPickerItem>
  presentation: EquipmentPickerItemPresentation
  ownedQuantity: number
  isGoldShoppingPath?: boolean
  onCommit?: () => boolean
}

export function EquipmentPickerDisclosureRow({
  rowArgs,
  presentation,
  ownedQuantity,
  isGoldShoppingPath = false,
  onCommit,
}: EquipmentPickerDisclosureRowProps) {
  const { isPending, successQuantity, commitFailed, commitQuantity } =
    useEquipmentAcquisitionQuantityCommit({
      commit: () => onCommit?.() ?? false,
    })

  const item = rowArgs.item
  const row = buildEquipmentPickerRowViewModel(item.equipment)
  const callout = getEquipmentPickerCallout(item, { isGoldShoppingPath })
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
            lines={mapEquipmentCompactSummaryToMetadataLines({
              kindLabel: row.kindLabel,
              comparisonGroups: row.comparisonGroups,
            })}
          />
        ),
        status: buildEquipmentPickerEntityStatus({
          callout,
          statusItems: presentation.statusItems,
        }),
      }}
      trailing={trailing}
    />
  )
}
