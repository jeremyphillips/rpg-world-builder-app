import {
  CatalogPickerActionButton,
  Text,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@rpg/ui'

import {
  EQUIPMENT_INVENTORY_RELEASE_LABEL,
  EQUIPMENT_INVENTORY_REMOVE_LABEL,
} from '../../../../lib/equipment/equipment-step.lib'
import { EquipmentQuantityStepper } from '../../equipment-quantity-stepper'
import type { EquipmentPickerHeaderControl } from './equipment-picker-item-header.lib'
import {
  equipmentPickerRowControlStatusVariants,
  equipmentPickerRowControlTooltipTriggerVariants,
} from './equipment-picker-row-acquisition-control.variants'

export const EQUIPMENT_PICKER_ADD_LABEL = 'Add'
export const EQUIPMENT_PICKER_ADD_FAILED_LABEL = 'Could not add this item.'

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
    const action = (
      <CatalogPickerActionButton intent="add" disabled onClick={() => undefined}>
        {control.label}
      </CatalogPickerActionButton>
    )
    if (!control.tooltip) return action

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span tabIndex={0} className={equipmentPickerRowControlTooltipTriggerVariants()}>
              {action}
            </span>
          </TooltipTrigger>
          <TooltipContent>{control.tooltip}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  if (control.kind === 'release') {
    return (
      <CatalogPickerActionButton intent="remove" onClick={() => onRelease(control.allowanceId)}>
        {EQUIPMENT_INVENTORY_RELEASE_LABEL}
      </CatalogPickerActionButton>
    )
  }

  if (control.kind === 'remove') {
    return (
      <CatalogPickerActionButton
        intent="remove"
        onClick={() => onRemovePurchase(control.purchaseId)}
      >
        {EQUIPMENT_INVENTORY_REMOVE_LABEL}
      </CatalogPickerActionButton>
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
    <>
      <CatalogPickerActionButton
        intent="add"
        disabled={control.disabled || isPending}
        onClick={onAdd}
      >
        {addLabel}
      </CatalogPickerActionButton>
      {commitFailed ? (
        <Text
          as="span"
          variant="destructive"
          className={equipmentPickerRowControlStatusVariants()}
          role="status"
        >
          {EQUIPMENT_PICKER_ADD_FAILED_LABEL}
        </Text>
      ) : null}
    </>
  )
}
