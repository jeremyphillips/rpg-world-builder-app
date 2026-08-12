'use client'

import { buildEquipmentPickerRowViewModel, EntityItem } from '@/features/content'
import { useEquipmentAcquisitionQuantityCommit } from '../../hooks/use-equipment-acquisition-quantity-commit.client'
import {
  CatalogPickerMetadataRenderer,
  mapEquipmentCompactSummaryToMetadataLines,
} from '../picker/catalog-picker-metadata'
import { resolveAcquisitionCommitButtonLabel } from './equipment-acquisition-commit-labels.lib'
import { EquipmentPickerCommerce } from './equipment-picker-commerce.client'
import { buildEquipmentPickerEntityStatus } from './equipment-picker-callout-presentation.lib'
import { getEquipmentPickerCallout } from './equipment-picker-callout.lib'
import type { EquipmentPickerItem } from './equipment-picker-drawer.types'
import type { EquipmentPickerItemPresentation } from './equipment-picker-item-header.lib'

const EQUIPMENT_PICKER_ADD_LABEL = 'Add'

export type EquipmentPickerItemRailProps = {
  item: EquipmentPickerItem
  presentation: EquipmentPickerItemPresentation
  ownedQuantity: number
  isGoldShoppingPath?: boolean
  onCommit?: () => boolean
}

export function EquipmentPickerItemRail({
  item,
  presentation,
  ownedQuantity,
  isGoldShoppingPath = false,
  onCommit,
}: EquipmentPickerItemRailProps) {
  const { isPending, successQuantity, commitQuantity } = useEquipmentAcquisitionQuantityCommit({
    commit: () => onCommit?.() ?? false,
  })

  const row = buildEquipmentPickerRowViewModel(item.equipment)
  const callout = getEquipmentPickerCallout(item, { isGoldShoppingPath })
  const addButtonLabel = resolveAcquisitionCommitButtonLabel({
    isPending,
    successQuantity,
    primaryActionLabel: EQUIPMENT_PICKER_ADD_LABEL,
  })

  return (
    <EntityItem
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
        status: buildEquipmentPickerEntityStatus({
          callout,
          statusItems: presentation.statusItems,
        }),
      }}
      density="compact"
      trailing={
        presentation.action.kind === 'add' ||
        (presentation.action.kind === 'manage_only' && ownedQuantity > 0)
          ? {
              kind: 'group',
              primary: (
                <EquipmentPickerCommerce
                  ownedQuantity={ownedQuantity}
                  showAdd={presentation.action.kind === 'add'}
                  disabled={
                    presentation.action.kind === 'add' ? presentation.action.disabled : false
                  }
                  buttonLabel={addButtonLabel}
                  isPending={isPending}
                  onAdd={() => commitQuantity(1)}
                />
              ),
              secondary: presentation.secondary,
            }
          : undefined
      }
    />
  )
}
