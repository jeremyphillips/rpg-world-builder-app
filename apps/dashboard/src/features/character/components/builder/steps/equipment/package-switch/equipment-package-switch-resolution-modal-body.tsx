import type { EquipmentPackageSwitchEvaluation } from '@rpg/contracts'
import { Text } from '@rpg/ui'

import {
  type EquipmentInventoryQuantityTarget,
  type EquipmentInventoryRemoveTarget,
} from '../../../../../lib/equipment/equipment-step.lib'

import { EquipmentInventoryColumn } from '../../../../equipment/inventory/column/equipment-inventory-column'
import { EquipmentPurchasedInventorySection } from '../../../../equipment/inventory/purchased/equipment-purchased-inventory-section'
import {
  PACKAGE_SWITCH_MODAL_CURRENT_PURCHASES_TITLE,
  type buildPackageSwitchDraftPurchasedGroups,
} from '../../../../../lib/equipment/equipment-package-switch-resolution.lib'
import {
  equipmentPackageSwitchResolutionAlertClasses,
  equipmentPackageSwitchResolutionBlockedBodyClasses,
  equipmentPackageSwitchResolutionModalInventoryScrollClasses,
  equipmentPackageSwitchResolutionSafetyNoteClasses,
} from './equipment-package-switch-resolution-modal.variants'
import { PackageSwitchBudgetSummary } from './equipment-package-switch-resolution-modal-summary'

export type EquipmentPackageSwitchResolutionModalBodyProps = {
  evaluation: EquipmentPackageSwitchEvaluation
  draftQuantitiesByPurchaseId: Record<string, number>
  purchasedGroups: ReturnType<typeof buildPackageSwitchDraftPurchasedGroups>
  isBlocked: boolean
  safetyNote: string
  staleMessage?: string
  inlineError?: string
  onSetPurchaseQuantity: (target: EquipmentInventoryQuantityTarget, quantity: number) => void
  onRemoveItem: (target: EquipmentInventoryRemoveTarget) => void
}

export function EquipmentPackageSwitchResolutionModalBody({
  evaluation,
  draftQuantitiesByPurchaseId,
  isBlocked,
  safetyNote,
  purchasedGroups,
  staleMessage,
  inlineError,
  onSetPurchaseQuantity,
  onRemoveItem,
}: EquipmentPackageSwitchResolutionModalBodyProps) {
  return (
    <>
      {staleMessage ? (
        <Text as="p" className={equipmentPackageSwitchResolutionAlertClasses} role="status">
          {staleMessage}
        </Text>
      ) : null}

      {isBlocked ? (
        <div className={equipmentPackageSwitchResolutionBlockedBodyClasses}>
          <PackageSwitchBudgetSummary
            evaluation={evaluation}
            draftQuantitiesByPurchaseId={draftQuantitiesByPurchaseId}
          />
        </div>
      ) : (
        <>
          <PackageSwitchBudgetSummary
            evaluation={evaluation}
            draftQuantitiesByPurchaseId={draftQuantitiesByPurchaseId}
          />

          <div className={equipmentPackageSwitchResolutionModalInventoryScrollClasses}>
            <EquipmentInventoryColumn title={PACKAGE_SWITCH_MODAL_CURRENT_PURCHASES_TITLE}>
              <EquipmentPurchasedInventorySection
                purchased={purchasedGroups}
                showGroupHeadings={false}
                allowZeroQuantity
                onSetPurchaseQuantity={onSetPurchaseQuantity}
                onRemoveItem={onRemoveItem}
              />
            </EquipmentInventoryColumn>
          </div>

          <Text as="p" className={equipmentPackageSwitchResolutionSafetyNoteClasses}>
            {safetyNote}
          </Text>
        </>
      )}

      {inlineError ? (
        <Text as="p" className={equipmentPackageSwitchResolutionAlertClasses} role="alert">
          {inlineError}
        </Text>
      ) : null}
    </>
  )
}
