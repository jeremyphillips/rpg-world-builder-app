import { ActionIcon, Text, iconGhostControlVariants } from '@rpg/ui'

import { ContentEntityCard, type EntityAnatomyTrailing } from '@/features/content'
import {
  type EquipmentInventoryQuantityTarget,
  type EquipmentInventoryRemoveTarget,
  type EquipmentInventoryRow,
} from '../../../../lib/equipment/equipment-step.lib'
import { type EquipmentInventoryDisplayItem } from '../../../../lib/equipment/equipment-inventory-summary.lib'
import type { EntitySummaryStatusItem } from '@/features/content'

import {
  buildEquipmentInventoryDisplayEntity,
  resolveInventoryRowTrailingMeta,
} from '../equipment-inventory-entity.lib'
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
      <ActionIcon action="remove" />
    </button>
  )
}

type InventoryRowActionVisibility = {
  showStepper: boolean
  showQtyLabel: boolean
  showRemove: boolean
  removeViaStepper: boolean
}

function resolveInventoryRowActionVisibility(
  row: EquipmentInventoryRow,
  onRemoveItem?: (target: EquipmentInventoryRemoveTarget) => void,
): InventoryRowActionVisibility {
  const showStepper = row.quantityMode === 'editable' && row.quantityTarget !== undefined
  const showQtyLabel = row.quantityMode === 'locked' && row.entry.quantity > 1
  const showRemove = canRemovePurchaseRow(row, onRemoveItem)

  return {
    showStepper,
    showQtyLabel,
    showRemove,
    removeViaStepper: showStepper && showRemove,
  }
}

function hasInventoryRowActions(visibility: InventoryRowActionVisibility): boolean {
  return visibility.showStepper || visibility.showQtyLabel || visibility.showRemove
}

function InventoryRowStepper({
  row,
  show,
  removeViaStepper,
  allowZeroQuantity = false,
  onRemoveItem,
  onSetPurchaseQuantity,
}: {
  row: EquipmentInventoryRow
  show: boolean
  removeViaStepper: boolean
  allowZeroQuantity?: boolean
  onRemoveItem?: (target: EquipmentInventoryRemoveTarget) => void
  onSetPurchaseQuantity?: (target: EquipmentInventoryQuantityTarget, quantity: number) => void
}) {
  if (!show) return null

  const removeTarget = row.removeTarget
  const removeThroughStepper =
    removeViaStepper && onRemoveItem !== undefined && removeTarget?.kind === 'purchase'

  return (
    <EquipmentInventoryQuantityControl
      row={row}
      allowZeroQuantity={allowZeroQuantity}
      onSetPurchaseQuantity={onSetPurchaseQuantity}
      onRemove={removeThroughStepper && onRemoveItem ? () => onRemoveItem(removeTarget) : undefined}
      removeAriaLabel={removeThroughStepper ? row.removeLabel : undefined}
    />
  )
}

function InventoryRowQuantityLabel({ row, show }: { row: EquipmentInventoryRow; show: boolean }) {
  if (!show) return null

  return (
    <Text as="span" className={equipmentInventoryRowQtyLabelClasses}>
      Qty {row.entry.quantity}
    </Text>
  )
}

function InventoryRowStandaloneRemove({
  row,
  show,
  onRemoveItem,
}: {
  row: EquipmentInventoryRow
  show: boolean
  onRemoveItem?: (target: EquipmentInventoryRemoveTarget) => void
}) {
  const removeTarget = row.removeTarget
  if (!show || onRemoveItem === undefined || removeTarget?.kind !== 'purchase') return null

  return (
    <InventoryRemoveIconButton
      removeLabel={row.removeLabel}
      onRemove={() => onRemoveItem(removeTarget)}
    />
  )
}

function resolveInventoryRowActions(args: {
  row: EquipmentInventoryRow
  allowZeroQuantity?: boolean
  onRemoveItem?: (target: EquipmentInventoryRemoveTarget) => void
  onSetPurchaseQuantity?: (target: EquipmentInventoryQuantityTarget, quantity: number) => void
}) {
  const { row, allowZeroQuantity = false, onRemoveItem, onSetPurchaseQuantity } = args
  const visibility = resolveInventoryRowActionVisibility(row, onRemoveItem)
  if (!hasInventoryRowActions(visibility)) return null

  return (
    <div className={equipmentInventoryRowActionsClasses}>
      <InventoryRowStepper
        row={row}
        show={visibility.showStepper}
        removeViaStepper={visibility.removeViaStepper}
        allowZeroQuantity={allowZeroQuantity}
        onRemoveItem={onRemoveItem}
        onSetPurchaseQuantity={onSetPurchaseQuantity}
      />
      <InventoryRowQuantityLabel row={row} show={visibility.showQtyLabel} />
      <InventoryRowStandaloneRemove
        row={row}
        show={visibility.showRemove && !visibility.removeViaStepper}
        onRemoveItem={onRemoveItem}
      />
    </div>
  )
}

function advisoryStatusForDisplay(
  display: EquipmentInventoryDisplayItem,
): readonly EntitySummaryStatusItem[] {
  if (display.kind === 'single') return display.row.advisoryStatusItems ?? []
  const withStatus = display.rows.find((row) => (row.advisoryStatusItems?.length ?? 0) > 0)
  return withStatus?.advisoryStatusItems ?? display.rows[0]?.advisoryStatusItems ?? []
}

function resolveInventoryRowTrailing(args: {
  display: EquipmentInventoryDisplayItem
  detailLabelOverride?: string
  actions: ReturnType<typeof resolveInventoryRowActions>
}): EntityAnatomyTrailing | undefined {
  const meta = resolveInventoryRowTrailingMeta(args.display, args.detailLabelOverride)
  if (args.actions) {
    return { kind: 'utility', content: args.actions, meta }
  }
  if (meta) {
    return { kind: 'indicator', variant: 'label', label: meta }
  }
  return undefined
}

export function EquipmentInventoryRowItem({
  display,
  allowZeroQuantity = false,
  detailLabelOverride,
  onRemoveItem,
  onSetPurchaseQuantity,
}: EquipmentInventoryRowProps) {
  const entity = buildEquipmentInventoryDisplayEntity(display, advisoryStatusForDisplay(display))

  if (display.kind === 'single') {
    const { row } = display
    const actions = resolveInventoryRowActions({
      row,
      allowZeroQuantity,
      onRemoveItem,
      onSetPurchaseQuantity,
    })

    return (
      <ContentEntityCard
        entity={entity}
        trailing={resolveInventoryRowTrailing({ display, detailLabelOverride, actions })}
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
  const actions = actionsRow
    ? resolveInventoryRowActions({
        row: actionsRow,
        allowZeroQuantity,
        onRemoveItem,
        onSetPurchaseQuantity,
      })
    : null

  return (
    <ContentEntityCard
      entity={entity}
      trailing={resolveInventoryRowTrailing({ display, detailLabelOverride, actions })}
      density="compact"
    />
  )
}
