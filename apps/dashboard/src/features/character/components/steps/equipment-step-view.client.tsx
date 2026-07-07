'use client'

import { ConfirmDialog, Text } from '@rpg/ui'

import {
  EQUIPMENT_STEP_NO_CLASS_MESSAGE,
  EQUIPMENT_STEP_NO_STARTING_EQUIPMENT_MESSAGE,
  EQUIPMENT_STEP_SWITCH_CONFIRM_DESCRIPTION,
  EQUIPMENT_STEP_SWITCH_CONFIRM_HEADLINE,
  buildEquipmentSkipPatch,
} from '../../lib/equipment-step.lib'
import { EquipmentPickerDrawer } from '../equipment/equipment-picker-drawer.client'
import { StartingEquipmentOptionCards } from '../equipment/starting-equipment-option-cards.client'
import {
  EquipmentStepFallback,
  EquipmentStepInventorySection,
  EquipmentStepShoppingSection,
} from './equipment-step-sections.client'
import { BuilderStepFrame } from './builder-step-frame.client'
import type { EquipmentStepProps } from './equipment-step.types'
import { useEquipmentStep } from './use-equipment-step.client'

export function EquipmentStepView({
  context: _context,
  draft,
  resolvedChoiceSets: _resolvedChoiceSets,
  validationIssues,
  onDraftChange,
  step,
}: EquipmentStepProps & { step: ReturnType<typeof useEquipmentStep> }) {
  const {
    catalogIndex,
    characterClass,
    classId,
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

  if (!classId || !characterClass) {
    return (
      <BuilderStepFrame stepId="equipment" validationIssues={validationIssues}>
        <Text variant="muted">{EQUIPMENT_STEP_NO_CLASS_MESSAGE}</Text>
      </BuilderStepFrame>
    )
  }

  if (equipmentChoiceSets.length === 0 || summaries.length === 0) {
    return (
      <BuilderStepFrame stepId="equipment" validationIssues={validationIssues}>
        <Text variant="muted">{EQUIPMENT_STEP_NO_STARTING_EQUIPMENT_MESSAGE}</Text>
      </BuilderStepFrame>
    )
  }

  if (draft.equipment?.skipped) {
    return (
      <BuilderStepFrame stepId="equipment" validationIssues={validationIssues}>
        <Text variant="muted">Continuing without starting equipment.</Text>
      </BuilderStepFrame>
    )
  }

  return (
    <BuilderStepFrame stepId="equipment" validationIssues={validationIssues}>
      <div className="space-y-8">
        {showFallback ? (
          <EquipmentStepFallback
            onContinueWithout={() => onDraftChange({ equipment: buildEquipmentSkipPatch() })}
          />
        ) : (
          <StartingEquipmentOptionCards
            characterClass={characterClass}
            catalogIndex={catalogIndex}
            summaries={summaries}
            draft={draft}
            selectedOptionId={selectedOptionId}
            onSelectOption={requestSelection}
            onNestedPoolChange={onNestedPoolChange}
          />
        )}

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
    </BuilderStepFrame>
  )
}
