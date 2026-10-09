import { CatalogPickerRowAction } from '@rpg/ui'

import {
  EQUIPMENT_INVENTORY_RELEASE_LABEL,
  EQUIPMENT_INVENTORY_REMOVE_LABEL,
} from '../../../../lib/equipment/equipment-step.lib'
import { resolvePickerPendingLabel } from '../../../../lib/picker/picker-mutation-family'
import { EquipmentQuantityStepper } from '../../equipment-quantity-stepper'
import type { EquipmentPickerHeaderControl } from './equipment-picker-item-header.lib'

const EQUIPMENT_ADD_PENDING_LABEL = resolvePickerPendingLabel('genericSelection', 'acquire')

export type EquipmentPickerRowAcquisitionControlProps = {
  control: EquipmentPickerHeaderControl
  equipmentName: string
  addLabel: string
  isPending?: boolean
  commitFailed?: boolean
  /** Announced after the purchased aggregate changes. */
  quantityAnnouncement?: string
  onAdd: () => void
  onSetPurchasedQuantity: (total: number) => void
  onRelease: (allowanceId: string) => void
  onRemovePurchase: (purchaseId: string) => void
}

/** The single header affordance — Add, the purchase stepper, Release, or Remove. */
export function EquipmentPickerRowAcquisitionControl({
  control,
  equipmentName,
  addLabel,
  isPending = false,
  commitFailed = false,
  quantityAnnouncement,
  onAdd,
  onSetPurchasedQuantity,
  onRelease,
  onRemovePurchase,
}: EquipmentPickerRowAcquisitionControlProps) {
  if (control.kind === 'none') return null

  if (control.kind === 'disabled') {
    return (
      <CatalogPickerRowAction
        intent="add"
        actionLabel={control.label}
        disabled
        tooltip={control.tooltip ? { body: control.tooltip } : undefined}
        onClick={() => undefined}
      />
    )
  }

  if (control.kind === 'release') {
    return (
      <CatalogPickerRowAction
        intent="remove"
        actionLabel={EQUIPMENT_INVENTORY_RELEASE_LABEL}
        onClick={() => onRelease(control.allowanceId)}
      />
    )
  }

  if (control.kind === 'remove') {
    return (
      <CatalogPickerRowAction
        intent="remove"
        actionLabel={EQUIPMENT_INVENTORY_REMOVE_LABEL}
        onClick={() => onRemovePurchase(control.purchaseId)}
      />
    )
  }

  if (control.kind === 'stepper') {
    return (
      <>
        <EquipmentQuantityStepper
          size="xs"
          digits={1}
          additional
          value={control.value}
          min={1}
          max={control.max}
          ariaLabel={`Purchased quantity of ${equipmentName}`}
          remove={{
            ariaLabel: `Remove purchased ${equipmentName}`,
            onRemove: () => onSetPurchasedQuantity(0),
          }}
          onChange={onSetPurchasedQuantity}
        />
        <span className="sr-only" role="status">
          {quantityAnnouncement}
        </span>
      </>
    )
  }

  return (
    <CatalogPickerRowAction
      intent="add"
      actionLabel={addLabel}
      pending={isPending}
      pendingLabel={EQUIPMENT_ADD_PENDING_LABEL}
      disabled={control.disabled || isPending}
      failed={commitFailed}
      onClick={onAdd}
    />
  )
}
