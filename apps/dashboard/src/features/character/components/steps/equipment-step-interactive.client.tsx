'use client'

import { ConfirmDialog } from '@rpg/ui'

import type { BuilderStepReadinessState } from '@rpg/contracts'

import {
  EQUIPMENT_STEP_SWITCH_CONFIRM_DESCRIPTION,
  EQUIPMENT_STEP_SWITCH_CONFIRM_HEADLINE,
  buildEquipmentSkipPatch,
} from '../../lib/equipment-step.lib'
import { showsBuilderStepReviewMessage } from '../../lib/builder-step-readiness.lib'
import { EquipmentPickerDrawer } from '../equipment/equipment-picker-drawer.client'
import { StartingEquipmentOptionCards } from '../equipment/starting-equipment-option-cards.client'
import {
  EquipmentStepFallback,
  EquipmentStepInventorySection,
  EquipmentStepShoppingSection,
} from './equipment-step-sections.client'
import { BuilderStepReadinessPanel } from './builder-step-readiness-panel.client'
import type { EquipmentStepProps } from './equipment-step.types'
import type { useEquipmentStep } from './use-equipment-step.client'

type EquipmentStepInteractiveProps = Pick<EquipmentStepProps, 'draft' | 'onDraftChange'> & {
  step: ReturnType<typeof useEquipmentStep>
  readiness: BuilderStepReadinessState
}

export function EquipmentStepInteractive({
  draft,
  onDraftChange,
  step,
  readiness,
}: EquipmentStepInteractiveProps) {
  const {
    catalogIndex,
    characterClass,
    equipmentChoiceSets,
    summaries,
    selectedOptionId,
    showFallback,
    showShopping,
    budget,
    pickerItems,
    characterPreviewContext,
    activePickerFlow,
    ownedPurchaseQuantities,
    pendingSelection,
    setPendingSelection,
    pickerOpen,
    setPickerOpen,
    requestSelection,
    openPicker,
    handleAddItem,
    handleSetPurchaseQuantity,
    applySelection,
    onRemoveItem,
    onNestedPoolChange,
    isUniqueEquipmentOwned,
  } = step

  return (
    <>
      <div className="space-y-8">
        {showsBuilderStepReviewMessage(readiness) ? (
          <BuilderStepReadinessPanel state={readiness} />
        ) : null}

        {showFallback ? (
          <EquipmentStepFallback
            onContinueWithout={() => onDraftChange({ equipment: buildEquipmentSkipPatch() })}
          />
        ) : equipmentChoiceSets.length > 0 && summaries.length > 0 ? (
          <StartingEquipmentOptionCards
            characterClass={characterClass!}
            catalogIndex={catalogIndex}
            summaries={summaries}
            draft={draft}
            selectedOptionId={selectedOptionId}
            onSelectOption={requestSelection}
            onNestedPoolChange={onNestedPoolChange}
          />
        ) : null}

        {showShopping && budget ? (
          <EquipmentStepShoppingSection
            budget={budget}
            activePickerFlow={activePickerFlow}
            customized={draft.equipment?.customized}
            onOpenPicker={openPicker}
          />
        ) : null}

        <EquipmentStepInventorySection
          draft={draft}
          catalogIndex={catalogIndex}
          budget={budget}
          onRemoveItem={onRemoveItem}
          onSetPurchaseQuantity={handleSetPurchaseQuantity}
        />
      </div>

      <EquipmentPickerDrawer
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        items={pickerItems}
        budget={budget}
        defaultTab="recommended"
        showCharacterPreview
        characterPreviewContext={characterPreviewContext}
        ownedPurchaseQuantities={ownedPurchaseQuantities}
        isUniqueEquipmentOwned={isUniqueEquipmentOwned}
        onAddItem={handleAddItem}
      />

      <ConfirmDialog
        open={pendingSelection !== null}
        onOpenChange={(open) => {
          if (!open) setPendingSelection(null)
        }}
        headline={EQUIPMENT_STEP_SWITCH_CONFIRM_HEADLINE}
        description={EQUIPMENT_STEP_SWITCH_CONFIRM_DESCRIPTION}
        confirmLabel="Switch equipment"
        cancelLabel="Keep current selection"
        onConfirm={() => {
          if (!pendingSelection) return
          applySelection(pendingSelection)
          setPendingSelection(null)
        }}
        onCancel={() => setPendingSelection(null)}
      />
    </>
  )
}
