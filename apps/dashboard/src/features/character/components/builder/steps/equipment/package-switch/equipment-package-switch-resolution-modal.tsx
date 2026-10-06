import { useMemo, useState } from 'react'

import type {
  CharacterBuildCatalogIndex,
  CharacterBuildContext,
  CharacterBuilderDraft,
  ChoiceSet,
  EquipmentPackageSwitchBlockingReason,
  EquipmentPackageSwitchEvaluation,
} from '@rpg/contracts'
import { Modal } from '@rpg/ui'

import {
  type EquipmentInventoryQuantityTarget,
  type EquipmentInventoryRemoveTarget,
} from '../../../../../lib/equipment/equipment-step.lib'

import {
  buildPackageSwitchDraftPurchasedGroups,
  resolvePackageSwitchModalState,
  resolvePackageSwitchSelectionFacts,
} from '../../../../../lib/equipment/equipment-package-switch-resolution.lib'
import { EquipmentPackageSwitchResolutionModalBody } from './equipment-package-switch-resolution-modal-body'
import { EquipmentPackageSwitchResolutionModalFooter } from './equipment-package-switch-resolution-modal-footer'
import { equipmentPackageSwitchResolutionModalBodyClasses } from './equipment-package-switch-resolution-modal.variants'

export type EquipmentPackageSwitchResolutionModalProps = {
  open: boolean
  catalogIndex: CharacterBuildCatalogIndex
  draft: CharacterBuilderDraft
  context: CharacterBuildContext
  choiceSets: readonly ChoiceSet[]
  evaluation: EquipmentPackageSwitchEvaluation
  nestedSelections?: CharacterBuilderDraft['choiceSelections']
  draftQuantitiesByPurchaseId: Record<string, number>
  commitErrorReason?: EquipmentPackageSwitchBlockingReason
  staleNotice?: boolean
  isCommitting?: boolean
  isInitialSelection?: boolean
  onOpenChange: (open: boolean) => void
  onDraftQuantityChange: (purchaseId: string, quantity: number) => void
  onConfirm: () => void
}

export function EquipmentPackageSwitchResolutionModal({
  open,
  catalogIndex,
  draft,
  context,
  choiceSets,
  evaluation,
  nestedSelections,
  draftQuantitiesByPurchaseId,
  commitErrorReason,
  staleNotice = false,
  isCommitting = false,
  isInitialSelection = false,
  onOpenChange,
  onDraftQuantityChange,
  onConfirm,
}: EquipmentPackageSwitchResolutionModalProps) {
  const [returnFocusElement] = useState(() => {
    if (typeof document === 'undefined') return null
    const active = document.activeElement
    return active instanceof HTMLElement ? active : null
  })

  const { targetOptionId } = evaluation
  // Quantity edits re-evaluate the switch; key the derivation on the trimmable set instead.
  const trimmablePurchaseIdsKey = JSON.stringify(
    evaluation.editableItems.map((item) => item.purchaseId),
  )
  const selectionFacts = useMemo(
    () =>
      resolvePackageSwitchSelectionFacts({
        draft,
        catalogIndex,
        choiceSets,
        rulesetId: context.rulesetId,
        targetOptionId,
        trimmablePurchaseIds: JSON.parse(trimmablePurchaseIdsKey) as string[],
        nestedSelections,
      }),
    [
      catalogIndex,
      choiceSets,
      context.rulesetId,
      draft,
      nestedSelections,
      targetOptionId,
      trimmablePurchaseIdsKey,
    ],
  )
  const purchasedGroups = useMemo(
    () =>
      buildPackageSwitchDraftPurchasedGroups({
        evaluation,
        draftQuantitiesByPurchaseId,
        catalogIndex,
        selectionFacts,
      }),
    [catalogIndex, draftQuantitiesByPurchaseId, evaluation, selectionFacts],
  )
  const modalState = resolvePackageSwitchModalState({
    evaluation,
    commitErrorReason,
    staleNotice,
    isCommitting,
    isInitialSelection,
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
          description={
            modalState.descriptionParts ? (
              <>
                <span className="block">{modalState.descriptionParts.lead}</span>
                <span className="block">{modalState.descriptionParts.detail}</span>
              </>
            ) : (
              modalState.description
            )
          }
        />
        <Modal.Body className={equipmentPackageSwitchResolutionModalBodyClasses}>
          <EquipmentPackageSwitchResolutionModalBody
            evaluation={evaluation}
            draftQuantitiesByPurchaseId={draftQuantitiesByPurchaseId}
            purchasedGroups={purchasedGroups}
            isBlocked={modalState.isBlocked}
            safetyNote={modalState.safetyNote}
            staleMessage={modalState.staleMessage}
            inlineError={modalState.inlineError}
            onSetPurchaseQuantity={handleSetPurchaseQuantity}
            onRemoveItem={handleRemoveItem}
          />
        </Modal.Body>
        <Modal.Footer>
          <Modal.FooterActions>
            <EquipmentPackageSwitchResolutionModalFooter
              isBlocked={modalState.isBlocked}
              confirmLabel={modalState.confirmLabel}
              confirmDisabled={modalState.confirmDisabled}
              isCommitting={isCommitting}
              helperMessage={modalState.helperMessage}
              onCancel={() => onOpenChange(false)}
              onConfirm={onConfirm}
            />
          </Modal.FooterActions>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  )
}
