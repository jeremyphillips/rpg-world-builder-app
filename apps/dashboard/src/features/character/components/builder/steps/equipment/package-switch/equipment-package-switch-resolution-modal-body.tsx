import type { EquipmentPackageSwitchEvaluation } from '@rpg/contracts'
import { Text } from '@rpg/ui'

import {
  type EquipmentInventoryQuantityTarget,
  type EquipmentInventoryRemoveTarget,
} from '../../../../../lib/equipment/equipment-step.lib'

import { EquipmentPurchasedInventorySection } from '../../../../equipment/inventory/purchased/equipment-purchased-inventory-section'
import {
  PACKAGE_SWITCH_MODAL_CURRENT_PURCHASES_TITLE,
  type buildPackageSwitchDraftPurchasedGroups,
} from '../../../../../lib/equipment/equipment-package-switch-resolution.lib'
import { PackageSwitchBudgetSummary } from './equipment-package-switch-resolution-modal-summary'

/** Scrollport for purchased inventory inside the package-switch modal. */
export const packageSwitchModalInventoryScrollClasses =
  'max-h-72 min-w-0 overflow-y-auto overflow-x-hidden pe-3'

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
        <Text as="p" className="text-sm text-destructive" role="status">
          {staleMessage}
        </Text>
      ) : null}

      {isBlocked ? (
        <div className="space-y-3 text-style-supporting">
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

          <div className={packageSwitchModalInventoryScrollClasses}>
            <section className="space-y-3">
              <Text as="h4" variant="label">
                {PACKAGE_SWITCH_MODAL_CURRENT_PURCHASES_TITLE}
              </Text>
              <EquipmentPurchasedInventorySection
                purchased={purchasedGroups}
                showGroupHeadings={false}
                allowZeroQuantity
                onSetPurchaseQuantity={onSetPurchaseQuantity}
                onRemoveItem={onRemoveItem}
              />
            </section>
          </div>

          <Text as="p" variant="caption">
            {safetyNote}
          </Text>
        </>
      )}

      {inlineError ? (
        <Text as="p" className="text-sm text-destructive" role="alert">
          {inlineError}
        </Text>
      ) : null}
    </>
  )
}
