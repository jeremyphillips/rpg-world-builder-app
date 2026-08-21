import { Trash2 } from 'lucide-react'

import { Text, iconGhostControlVariants } from '@rpg/ui'

import { ContentEntityCard } from '@/features/content'
import {
  type EquipmentInventoryQuantityTarget,
  type EquipmentInventoryRemoveTarget,
  type EquipmentInventoryRow,
} from '../../../../lib/equipment/equipment-step.lib'
import { type EquipmentInventoryDisplayItem } from '../../../../lib/equipment/equipment-inventory-summary.lib'
import { buildEquipmentInventoryDisplayEntity } from '../equipment-inventory-entity.lib'
import { EquipmentInventoryQuantityControl } from './equipment-inventory-quantity-control'
import {
  equipmentInventoryRowActionsClasses,
  equipmentInventoryRowQtyLabelClasses,
} from '../equipment-inventory.variants'

export type EquipmentInventoryRowProps = {
  display: EquipmentInventoryDisplayItem
  allowZeroQuantity?: boolean
  detailLabelOverride?: string
  onRemoveItem?: (target: EquipmentInventoryRemoveTarget) => void
  onSetPurchaseQuantity?: (target: EquipmentInventoryQuantityTarget, quantity: number) => void
}

function canRemovePurchaseRow(
  row: EquipmentInventoryRow,
  onRemoveItem?: (target: EquipmentInventoryRemoveTarget) => void,
): row is EquipmentInventoryRow & { removeTarget: EquipmentInventoryRemoveTarget } {
  return row.removeTarget?.kind === 'purchase' && onRemoveItem !== undefined
}

function InventoryRemoveIconButton({
  removeLabel,
  onRemove,
}: {
  removeLabel: string
  onRemove: () => void
}) {
  return (
    <button
      type="button"
      className={iconGhostControlVariants({ hover: 'destructive', layout: 'flex' })}
      aria-label={removeLabel}
      onClick={onRemove}
    >
      <Trash2 aria-hidden />
    </button>
  )
}

function InventoryRowActions({
  row,
  allowZeroQuantity = false,
  onRemoveItem,
  onSetPurchaseQuantity,
}: {
  row: EquipmentInventoryRow
  allowZeroQuantity?: boolean
  onRemoveItem?: (target: EquipmentInventoryRemoveTarget) => void
  onSetPurchaseQuantity?: (target: EquipmentInventoryQuantityTarget, quantity: number) => void
}) {
  const showStepper = row.quantityMode === 'editable' && row.quantityTarget !== undefined
  const showQtyLabel = row.quantityMode === 'locked' && row.entry.quantity > 1
  const showRemove = canRemovePurchaseRow(row, onRemoveItem)

  if (!showStepper && !showQtyLabel && !showRemove) return null

  return (
    <div className={equipmentInventoryRowActionsClasses}>
      {showStepper ? (
        <EquipmentInventoryQuantityControl
          row={row}
          allowZeroQuantity={allowZeroQuantity}
          onSetPurchaseQuantity={onSetPurchaseQuantity}
        />
      ) : null}
      {showQtyLabel ? (
        <Text as="span" className={equipmentInventoryRowQtyLabelClasses}>
          Qty {row.entry.quantity}
        </Text>
      ) : null}
      {showRemove ? (
        <InventoryRemoveIconButton
          removeLabel={row.removeLabel}
          onRemove={() => onRemoveItem!(row.removeTarget)}
        />
      ) : null}
    </div>
  )
}

export function EquipmentInventoryRowItem({
  display,
  allowZeroQuantity = false,
  detailLabelOverride,
  onRemoveItem,
  onSetPurchaseQuantity,
}: EquipmentInventoryRowProps) {
  const entity = buildEquipmentInventoryDisplayEntity(display, detailLabelOverride)

  if (display.kind === 'single') {
    const { row } = display
    const actions = (
      <InventoryRowActions
        row={row}
        allowZeroQuantity={allowZeroQuantity}
        onRemoveItem={onRemoveItem}
        onSetPurchaseQuantity={onSetPurchaseQuantity}
      />
    )

    return (
      <ContentEntityCard
        entity={entity}
        trailing={{ kind: 'action', content: actions }}
        density="compact"
        disabled={row.stagedRemoval}
      />
    )
  }

  const editableRow = display.rows.find(
    (row) => row.quantityMode === 'editable' && row.quantityTarget !== undefined,
  )
  const removablePurchaseRow = display.rows.find((row) => canRemovePurchaseRow(row, onRemoveItem))
  const actionsRow = editableRow ?? removablePurchaseRow

  return (
    <ContentEntityCard
      entity={entity}
      trailing={
        actionsRow
          ? {
              kind: 'action',
              content: (
                <InventoryRowActions
                  row={actionsRow}
                  allowZeroQuantity={allowZeroQuantity}
                  onRemoveItem={onRemoveItem}
                  onSetPurchaseQuantity={onSetPurchaseQuantity}
                />
              ),
            }
          : undefined
      }
      density="compact"
    />
  )
}
