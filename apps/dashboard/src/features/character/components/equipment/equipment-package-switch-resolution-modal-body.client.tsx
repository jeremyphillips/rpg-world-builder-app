'use client'

import type { EquipmentPackageSwitchEvaluation } from '@rpg/contracts'
import { Text } from '@rpg/ui'

import {
  type EquipmentInventoryQuantityTarget,
  type EquipmentInventoryRemoveTarget,
} from '../../lib/equipment/equipment-step.lib'

import { EquipmentInventoryColumn } from './equipment-inventory-column.client'
import { EquipmentPurchasedInventorySection } from './equipment-purchased-inventory-section.client'
import {
  buildPackageSwitchDraftPurchasedGroups,
  PACKAGE_SWITCH_SAFETY_NOTE,
} from './equipment-package-switch-resolution.lib'
import {
  equipmentPackageSwitchResolutionAlertClasses,
  equipmentPackageSwitchResolutionBlockedBodyClasses,
  equipmentPackageSwitchResolutionModalInventoryScrollClasses,
  equipmentPackageSwitchResolutionSafetyNoteClasses,
} from './equipment-package-switch-resolution-modal.variants'
import { PackageSwitchBudgetSummary } from './equipment-package-switch-resolution-modal-summary.client'

export type EquipmentPackageSwitchResolutionModalBodyProps = {
  evaluation: EquipmentPackageSwitchEvaluation
  draftQuantitiesByPurchaseId: Record<string, number>
  purchasedGroups: ReturnType<typeof buildPackageSwitchDraftPurchasedGroups>
  isBlocked: boolean
  staleMessage?: string
  inlineError?: string
  onSetPurchaseQuantity: (target: EquipmentInventoryQuantityTarget, quantity: number) => void
  onRemoveItem: (target: EquipmentInventoryRemoveTarget) => void
}

export function EquipmentPackageSwitchResolutionModalBody({
  evaluation,
  draftQuantitiesByPurchaseId,
  isBlocked,
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
            <EquipmentInventoryColumn title="Purchased with starting gold">
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
            {PACKAGE_SWITCH_SAFETY_NOTE}
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
