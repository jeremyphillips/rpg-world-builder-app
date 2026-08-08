'use client'

import { useMemo, useState } from 'react'

import type {
  CharacterBuildCatalogIndex,
  EquipmentPackageSwitchBlockingReason,
  EquipmentPackageSwitchEvaluation,
} from '@rpg/contracts'
import { Modal, dialogPanelActionRowClasses } from '@rpg/ui'

import {
  type EquipmentInventoryQuantityTarget,
  type EquipmentInventoryRemoveTarget,
} from '../../lib/equipment/equipment-step.lib'

import {
  buildPackageSwitchDraftPurchasedGroups,
  resolvePackageSwitchModalState,
} from './equipment-package-switch-resolution.lib'
import { EquipmentPackageSwitchResolutionModalBody } from './equipment-package-switch-resolution-modal-body.client'
import { EquipmentPackageSwitchResolutionModalFooter } from './equipment-package-switch-resolution-modal-footer.client'
import {
  equipmentPackageSwitchResolutionModalBodyClasses,
  equipmentPackageSwitchResolutionModalHeadlineClasses,
} from './equipment-package-switch-resolution-modal.variants'

export type EquipmentPackageSwitchResolutionModalProps = {
  open: boolean
  catalogIndex: CharacterBuildCatalogIndex
  evaluation: EquipmentPackageSwitchEvaluation
  draftQuantitiesByPurchaseId: Record<string, number>
  commitErrorReason?: EquipmentPackageSwitchBlockingReason
  staleNotice?: boolean
  isCommitting?: boolean
  onOpenChange: (open: boolean) => void
  onDraftQuantityChange: (purchaseId: string, quantity: number) => void
  onConfirm: () => void
}

export function EquipmentPackageSwitchResolutionModal({
  open,
  catalogIndex,
  evaluation,
  draftQuantitiesByPurchaseId,
  commitErrorReason,
  staleNotice = false,
  isCommitting = false,
  onOpenChange,
  onDraftQuantityChange,
  onConfirm,
}: EquipmentPackageSwitchResolutionModalProps) {
  const [returnFocusElement] = useState(() => {
    if (typeof document === 'undefined') return null
    const active = document.activeElement
    return active instanceof HTMLElement ? active : null
  })

  const purchasedGroups = useMemo(
    () =>
      buildPackageSwitchDraftPurchasedGroups({
        evaluation,
        draftQuantitiesByPurchaseId,
        catalogIndex,
      }),
    [catalogIndex, draftQuantitiesByPurchaseId, evaluation],
  )
  const modalState = resolvePackageSwitchModalState({
    evaluation,
    commitErrorReason,
    staleNotice,
    isCommitting,
  })

  const handleSetPurchaseQuantity = (
    target: EquipmentInventoryQuantityTarget,
    quantity: number,
  ) => {
    onDraftQuantityChange(target.purchaseId, quantity)
  }

  const handleRemoveItem = (target: EquipmentInventoryRemoveTarget) => {
    if (target.kind !== 'purchase') return
    onDraftQuantityChange(target.purchaseId, 0)
  }

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content
        size="lg"
        onCloseAutoFocus={(event) => {
          if (!(returnFocusElement instanceof HTMLElement)) return
          event.preventDefault()
          returnFocusElement.focus()
        }}
      >
        <Modal.Header
          headline={modalState.title}
          description={modalState.description}
          headlineClassName={equipmentPackageSwitchResolutionModalHeadlineClasses}
        />
        <Modal.Body className={equipmentPackageSwitchResolutionModalBodyClasses}>
          <EquipmentPackageSwitchResolutionModalBody
            evaluation={evaluation}
            draftQuantitiesByPurchaseId={draftQuantitiesByPurchaseId}
            purchasedGroups={purchasedGroups}
            isBlocked={modalState.isBlocked}
            staleMessage={modalState.staleMessage}
            inlineError={modalState.inlineError}
            onSetPurchaseQuantity={handleSetPurchaseQuantity}
            onRemoveItem={handleRemoveItem}
          />
        </Modal.Body>
        <Modal.Footer>
          <div className={dialogPanelActionRowClasses}>
            <EquipmentPackageSwitchResolutionModalFooter
              isBlocked={modalState.isBlocked}
              confirmDisabled={modalState.confirmDisabled}
              isCommitting={isCommitting}
              helperMessage={modalState.helperMessage}
              onCancel={() => onOpenChange(false)}
              onConfirm={onConfirm}
            />
          </div>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  )
}
