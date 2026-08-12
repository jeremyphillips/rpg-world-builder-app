'use client'

import type { CatalogPickerCollapsibleRowRenderArgs } from '@rpg/ui'
import { Check, TriangleAlert } from 'lucide-react'

import { Badge } from '@rpg/ui'

import { buildEquipmentPickerRowViewModel } from '@/features/content'
import { useEquipmentAcquisitionQuantityCommit } from '../../hooks/use-equipment-acquisition-quantity-commit.client'
import { CatalogEntityDisclosureRow } from '@/features/content'
import {
  CatalogPickerMetadataRenderer,
  mapEquipmentCompactSummaryToMetadataLines,
} from '../picker/catalog-picker-metadata'
import { resolveAcquisitionCommitButtonLabel } from './equipment-acquisition-commit-labels.lib'
import { EquipmentPickerCommerce } from './equipment-picker-commerce.client'
import { getEquipmentCalloutPresentation } from './equipment-picker-callout-presentation.lib'
import { getEquipmentPickerCallout } from './equipment-picker-callout.lib'
import type { EquipmentPickerItem } from './equipment-picker-drawer.types'
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
  const { isPending, successQuantity, commitQuantity } = useEquipmentAcquisitionQuantityCommit({
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
              onAdd={() => commitQuantity(1)}
            />
          ),
          secondary: presentation.summaryTrailingLabel,
        }
      : undefined

  return (
    <CatalogEntityDisclosureRow
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
          <CatalogPickerMetadataRenderer
            lines={mapEquipmentCompactSummaryToMetadataLines({
              kindLabel: row.kindLabel,
              comparisonGroups: row.comparisonGroups,
            })}
          />
        ),
        status: [
          ...(callout ? [<EquipmentPickerCalloutBadge key="callout" callout={callout} />] : []),
        ],
      }}
      trailing={trailing}
    />
  )
}

function EquipmentPickerCalloutBadge({
  callout,
}: {
  callout: NonNullable<ReturnType<typeof getEquipmentPickerCallout>>
}) {
  const presentation = getEquipmentCalloutPresentation(callout)
  const leadingIcon =
    presentation.leadingIcon === 'check' ? (
      <Check aria-hidden />
    ) : presentation.leadingIcon === 'warning' ? (
      <TriangleAlert aria-hidden />
    ) : undefined

  return (
    <Badge
      appearance={presentation.appearance}
      tone={presentation.tone}
      size={presentation.size}
      leadingIcon={leadingIcon}
    >
      {callout.label}
    </Badge>
  )
}
