'use client'

import { Button, Heading, Text } from '@rpg/ui'
import type { Equipment } from '@rpg/contracts'

import { EQUIPMENT_MAGIC_ITEM_REMOVE_PURCHASE_LABEL } from '../../lib/equipment-step.lib'
import {
  EQUIPMENT_PICKER_GRANT_MANAGE_LABEL,
  EQUIPMENT_PICKER_GRANT_RELEASE_LABEL,
  EQUIPMENT_PICKER_GRANT_SECTION_LABEL,
  type EquipmentPickerRowActionViewModel,
} from './equipment-picker-action.lib'
import type { EquipmentPickerGrantViewModel } from './equipment-picker-grant.lib'
import { PurchaseQuantityRow, PurchaseRow } from './equipment-picker-purchase-rows.client'
import {
  equipmentPickerPurchaseInsetPanelClasses,
  equipmentPickerPurchaseInsetPanelContentClasses,
  equipmentPickerPurchaseRemoveActionClasses,
  equipmentPickerPurchaseRemoveActionsClasses,
} from './equipment-picker-purchase.variants'
import type { EquipmentPickerGrantManageSource } from './equipment-picker-grant.lib'

function GrantManageSection({
  equipment,
  manageSources,
  disabled,
  onReleaseGrant,
  onRemovePurchase,
}: {
  equipment: Equipment
  manageSources: EquipmentPickerGrantManageSource
  disabled: boolean
  onReleaseGrant?: EquipmentPickerGrantPanelProps['onReleaseGrant']
  onRemovePurchase?: EquipmentPickerGrantPanelProps['onRemovePurchase']
}) {
  return (
    <div className="space-y-2">
      {manageSources.grants.map((grant) => (
        <PurchaseRow
          key={grant.allowanceId}
          label="Currently owned"
          value={`${grant.quantity} grant`}
        />
      ))}
      {manageSources.purchases.map((purchase) => (
        <PurchaseRow
          key={purchase.purchaseId}
          label="Currently owned"
          value={`${purchase.quantity} purchased`}
        />
      ))}
      <div className={equipmentPickerPurchaseRemoveActionsClasses}>
        {manageSources.grants.map((grant) =>
          onReleaseGrant ? (
            <button
              key={grant.allowanceId}
              type="button"
              className={equipmentPickerPurchaseRemoveActionClasses}
              disabled={disabled}
              onClick={() =>
                onReleaseGrant({
                  allowanceId: grant.allowanceId,
                  equipmentId: equipment.id,
                  quantity: grant.quantity,
                })
              }
            >
              {EQUIPMENT_PICKER_GRANT_RELEASE_LABEL}
            </button>
          ) : null,
        )}
        {manageSources.purchases.map((purchase) =>
          onRemovePurchase ? (
            <button
              key={purchase.purchaseId}
              type="button"
              className={equipmentPickerPurchaseRemoveActionClasses}
              disabled={disabled}
              onClick={() =>
                onRemovePurchase({
                  purchaseId: purchase.purchaseId,
                  quantity: purchase.quantity,
                })
              }
            >
              {EQUIPMENT_MAGIC_ITEM_REMOVE_PURCHASE_LABEL}
            </button>
          ) : null,
        )}
      </div>
    </div>
  )
}

function GrantAddSection({
  equipment,
  rowActionVm,
  grantViewModel,
  disabled,
  onAddQuantityChange,
  onApplyMagicItemAcquisition,
}: {
  equipment: Equipment
  rowActionVm: Extract<EquipmentPickerRowActionViewModel, { kind: 'magic_item_grant' }>
  grantViewModel: EquipmentPickerGrantViewModel
  disabled: boolean
  onAddQuantityChange: (quantity: number) => void
  onApplyMagicItemAcquisition: (requestedQuantity: number) => void
}) {
  return (
    <div className="space-y-2">
      <PurchaseQuantityRow
        equipmentName={equipment.name}
        quantity={grantViewModel.quantity}
        maxQuantity={grantViewModel.maxQuantity}
        disabled={disabled || grantViewModel.commitDisabled}
        onQuantityChange={onAddQuantityChange}
      />

      <Text as="p" variant="muted" className="text-sm">
        {grantViewModel.requestedLabel}
      </Text>

      {grantViewModel.breakdownLabel ? (
        <Text as="p" variant="muted" className="text-sm">
          {grantViewModel.breakdownLabel}
        </Text>
      ) : null}

      {grantViewModel.secondaryPriceLabel ? (
        <Text as="p" variant="muted" className="text-sm">
          {grantViewModel.secondaryPriceLabel}
        </Text>
      ) : null}

      {grantViewModel.availableLabel ? (
        <Text as="p" variant="muted" className="text-sm">
          {grantViewModel.availableLabel}
        </Text>
      ) : null}

      {grantViewModel.addBlockedNote ? (
        <Text as="p" variant="warning" className="text-sm">
          {grantViewModel.addBlockedNote}
        </Text>
      ) : null}

      {grantViewModel.showPartialCommit || grantViewModel.showFullCommit ? (
        <Button
          type="button"
          size="sm"
          disabled={disabled || grantViewModel.commitDisabled}
          onClick={() => {
            const quantity = grantViewModel.showPartialCommit
              ? rowActionVm.plan.partialAction!.requestedQuantity
              : grantViewModel.quantity
            onApplyMagicItemAcquisition(quantity)
          }}
        >
          {grantViewModel.commitLabel}
        </Button>
      ) : null}
    </div>
  )
}

export type EquipmentPickerGrantPanelProps = {
  equipment: Equipment
  rowActionVm: Extract<EquipmentPickerRowActionViewModel, { kind: 'magic_item_grant' }>
  grantViewModel: EquipmentPickerGrantViewModel
  manageSources: EquipmentPickerGrantManageSource
  disabled: boolean
  onAddQuantityChange: (quantity: number) => void
  onApplyMagicItemAcquisition: (requestedQuantity: number) => void
  onReleaseGrant?: (args: { allowanceId: string; equipmentId: string; quantity: number }) => void
  onRemovePurchase?: (args: { purchaseId: string; quantity: number }) => void
}

export function EquipmentPickerGrantPanel({
  equipment,
  rowActionVm,
  grantViewModel,
  manageSources,
  disabled,
  onAddQuantityChange,
  onApplyMagicItemAcquisition,
  onReleaseGrant,
  onRemovePurchase,
}: EquipmentPickerGrantPanelProps) {
  const showManage = rowActionVm.capabilities.canManage

  return (
    <section aria-labelledby={`${equipment.id}-grant-heading`} className="space-y-3">
      <Heading variant="group" as="h3" id={`${equipment.id}-grant-heading`}>
        {showManage ? EQUIPMENT_PICKER_GRANT_MANAGE_LABEL : EQUIPMENT_PICKER_GRANT_SECTION_LABEL}
      </Heading>

      <div className={equipmentPickerPurchaseInsetPanelClasses}>
        <div className={equipmentPickerPurchaseInsetPanelContentClasses}>
          {showManage ? (
            <GrantManageSection
              equipment={equipment}
              manageSources={manageSources}
              disabled={disabled}
              onReleaseGrant={onReleaseGrant}
              onRemovePurchase={onRemovePurchase}
            />
          ) : null}

          {rowActionVm.maxAdditionalQuantity > 0 ? (
            <GrantAddSection
              equipment={equipment}
              rowActionVm={rowActionVm}
              grantViewModel={grantViewModel}
              disabled={disabled}
              onAddQuantityChange={onAddQuantityChange}
              onApplyMagicItemAcquisition={onApplyMagicItemAcquisition}
            />
          ) : grantViewModel.addBlockedNote ? (
            <Text as="p" variant="warning" className="text-sm">
              {grantViewModel.addBlockedNote}
            </Text>
          ) : null}
        </div>
      </div>
    </section>
  )
}
