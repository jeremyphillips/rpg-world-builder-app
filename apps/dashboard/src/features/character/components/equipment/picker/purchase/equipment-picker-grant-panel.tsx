import { useCallback } from 'react'

import { Heading } from '@rpg/ui'
import type { Equipment } from '@rpg/contracts'

import type { EquipmentPickerRowActionViewModel } from '../equipment-picker-action.lib'
import type { EquipmentPickerGrantViewModel } from './equipment-picker-grant.lib'
import type { EquipmentOwnedSourceAction } from '../../acquisition/equipment-acquisition-panel.lib'
import { EquipmentAcquisitionPanelBody } from '../../acquisition/equipment-acquisition-panel-body'
import type { EquipmentPickerGrantManageSource } from './equipment-picker-grant.lib'
import {
  equipmentPickerPurchaseInsetPanelClasses,
  equipmentPickerPurchaseInsetPanelContentClasses,
} from './equipment-picker-purchase.variants'
import { useEquipmentAcquisitionQuantityCommit } from '../../../../hooks/use-equipment-acquisition-quantity-commit'
import type { EquipmentInventoryManagePanelBodyProps } from '../../inventory/manage/equipment-inventory-manage-panel'

export type EquipmentPickerGrantPanelProps = {
  equipment: Equipment
  rowActionVm: Extract<EquipmentPickerRowActionViewModel, { kind: 'magic_item_grant' }>
  grantViewModel: EquipmentPickerGrantViewModel
  manageSources: EquipmentPickerGrantManageSource
  draft: EquipmentInventoryManagePanelBodyProps['draft']
  context: EquipmentInventoryManagePanelBodyProps['context']
  catalogIndex: EquipmentInventoryManagePanelBodyProps['catalogIndex']
  budget?: EquipmentInventoryManagePanelBodyProps['budget']
  rows: EquipmentInventoryManagePanelBodyProps['rows']
  disabled: boolean
  onApplyMagicItemAcquisition: (requestedQuantity: number) => boolean
  onReleaseGrant?: (args: { allowanceId: string; equipmentId: string; quantity: number }) => void
  onRemovePurchase?: (args: { purchaseId: string; quantity: number }) => void
  sectionLabel: string
}

export function EquipmentPickerGrantPanel({
  equipment,
  rowActionVm: _rowActionVm,
  grantViewModel: _grantViewModel,
  manageSources: _manageSources,
  draft,
  context,
  catalogIndex,
  budget,
  rows,
  disabled,
  onApplyMagicItemAcquisition,
  onReleaseGrant,
  onRemovePurchase,
  sectionLabel,
}: EquipmentPickerGrantPanelProps) {
  const commitAcquisition = useCallback(
    (requestedQuantity: number) => onApplyMagicItemAcquisition(requestedQuantity),
    [onApplyMagicItemAcquisition],
  )

  const { quantity, setQuantity, isPending, successQuantity, commitQuantity } =
    useEquipmentAcquisitionQuantityCommit({ commit: commitAcquisition })

  const handleSourceAction = useCallback(
    (action: EquipmentOwnedSourceAction) => {
      if (disabled) return

      if (action.target.kind === 'magicItemGrant') {
        onReleaseGrant?.({
          allowanceId: action.target.allowanceId,
          equipmentId: action.target.equipmentId,
          quantity: action.quantity,
        })
        return
      }

      onRemovePurchase?.({
        purchaseId: action.target.purchaseId,
        quantity: action.quantity,
      })
    },
    [disabled, onReleaseGrant, onRemovePurchase],
  )

  return (
    <section aria-labelledby={`${equipment.id}-grant-heading`} className="space-y-3">
      <Heading variant="group" as="h3" id={`${equipment.id}-grant-heading`}>
        {sectionLabel}
      </Heading>

      <div className={equipmentPickerPurchaseInsetPanelClasses}>
        <div className={equipmentPickerPurchaseInsetPanelContentClasses}>
          <EquipmentAcquisitionPanelBody
            draft={draft}
            context={context}
            catalogIndex={catalogIndex}
            equipment={equipment}
            rows={rows}
            budget={budget}
            quantity={quantity}
            onQuantityChange={setQuantity}
            isPending={disabled || isPending}
            successQuantity={successQuantity}
            onSourceAction={handleSourceAction}
            onCommit={commitQuantity}
          />
        </div>
      </div>
    </section>
  )
}
