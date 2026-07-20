'use client'

import { ConfirmDialog } from '@rpg/ui'

import type { BuilderStepReadinessState } from '@rpg/contracts'

import {
  EQUIPMENT_STEP_SWITCH_CONFIRM_DESCRIPTION,
  EQUIPMENT_STEP_SWITCH_CONFIRM_HEADLINE,
  buildEquipmentSkipPatch,
} from '../../lib/equipment-step.lib'
import { showsBuilderStepReviewMessage } from '../../lib/builder-step-readiness.lib'
import { EquipmentAcquisitionGuidance } from '../equipment/equipment-acquisition-guidance.client'
import { EquipmentPackageSwitchResolutionModal } from '../equipment/equipment-package-switch-resolution-modal.client'
import { EquipmentPickerDrawer } from '../equipment/equipment-picker-drawer.client'
import { StartingEquipmentOptionSection } from '../equipment/starting-equipment-option-section.client'
import { equipmentStepSwitchConfirmHeadlineClasses } from './equipment-step-interactive.variants'
import {
  EquipmentStepFallback,
  EquipmentStepInventorySection,
  EquipmentStepReplacedClassOptionsNotice,
} from './equipment-step-sections.client'
import { BuilderStepReadinessPanel } from './builder-step-readiness-panel.client'
import type { EquipmentStepProps } from './equipment-step.types'
import type { useEquipmentStep } from './use-equipment-step.client'
import { useEquipmentPickerAcquisition } from './use-equipment-picker-acquisition.client'

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
    showBudget,
    showShopping,
    budget,
    pickerBrowseSortContext,
    characterPreviewContext,
    ownedPurchaseQuantities,
    pendingSelection,
    setPendingSelection,
    pendingPackageSwitch,
    packageSwitchEvaluation,
    dismissPackageSwitch,
    handleDraftPackageSwitchQuantity,
    handleCommitPackageSwitch,
    isPackageSwitchCommitting,
    pickerOpen,
    setPickerOpen,
    requestSelection,
    handleAddItem,
    handleSetPurchaseQuantity,
    handleRemoveFromInventory,
    handleRemoveOneFromInventory,
    applySelection,
    onRemoveItem,
    onNestedPoolChange,
    onChoiceSelectionChange,
    resolvedChoiceSets,
  } = step

  const pickerAcquisition = useEquipmentPickerAcquisition({
    draft,
    context: step.context,
    catalogIndex: step.catalogIndex,
    budget,
    showBudget: Boolean(showBudget),
    focusedAllowanceId: step.focusedAllowanceId,
    onDraftChange,
  })

  const showAcquisitionGuidance =
    selectedOptionId !== undefined &&
    !showFallback &&
    (step.showPurchaseWorkflow || step.showMagicItemGrants)

  return (
    <>
      <div className="space-y-8">
        {showsBuilderStepReviewMessage(readiness) ? (
          <BuilderStepReadinessPanel state={readiness} />
        ) : null}

        {step.classOptionsReplaced ? (
          <EquipmentStepReplacedClassOptionsNotice tierLabel={step.tierLabel} />
        ) : showFallback ? (
          <EquipmentStepFallback
            onContinueWithout={() => onDraftChange({ equipment: buildEquipmentSkipPatch() })}
          />
        ) : equipmentChoiceSets.length > 0 && summaries.length > 0 ? (
          <StartingEquipmentOptionSection
            characterClass={characterClass!}
            catalogIndex={catalogIndex}
            summaries={summaries}
            draft={draft}
            resolvedChoiceSets={resolvedChoiceSets}
            selectedOptionId={selectedOptionId}
            isPackageChooserExpanded={step.isPackageChooserExpanded}
            onSelectOption={requestSelection}
            onNestedPoolChange={onNestedPoolChange}
            onChoiceSelectionChange={onChoiceSelectionChange}
            onChangePackage={step.expandPackageChooser}
            onCollapseChooser={step.collapsePackageChooser}
          />
        ) : null}

        {showAcquisitionGuidance ? (
          <EquipmentAcquisitionGuidance
            showPurchaseWorkflow={step.showPurchaseWorkflow}
            budget={budget}
            onOpenPurchasePicker={() => step.openPicker('purchase')}
            showMagicItemGrants={step.showMagicItemGrants}
            magicItemProgress={step.acquisition.progress}
            onOpenMagicItemsPicker={() => step.openPicker('magic_items')}
          />
        ) : null}

        <EquipmentStepInventorySection
          draft={draft}
          catalogIndex={catalogIndex}
          context={step.context}
          budget={budget}
          goldOptionFunding={step.goldOptionFunding}
          classOptionPolicy={step.classOptionPolicy}
          conversionEditorOpen={step.conversionEditorOpen}
          selectedPackageItemKeys={step.selectedPackageItemKeys}
          conversionCommitStatusMessage={step.conversionCommitStatusMessage}
          onRemoveItem={onRemoveItem}
          onSetPurchaseQuantity={handleSetPurchaseQuantity}
          onReleaseGrant={pickerAcquisition.handleReleaseGrant}
          onRemovePurchase={pickerAcquisition.handleRemovePurchase}
          onApplyMagicItemAcquisition={pickerAcquisition.handleApplyMagicItemAcquisition}
          onCustomizePackage={() => step.openConversionEditor()}
          onChangeEquipmentOption={() => {
            step.expandPackageChooser()
            document.getElementById('starting-equipment-options')?.scrollIntoView?.({
              behavior: 'smooth',
              block: 'start',
            })
            document.getElementById('starting-equipment-options')?.focus()
          }}
          onSelectedPackageItemKeysChange={step.setSelectedPackageItemKeys}
          onCancelConversion={() => step.setConversionEditorOpen(false)}
          onCommitConversion={step.handleCommitConversion}
        />
      </div>

      <EquipmentPickerDrawer
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        items={step.pickerItems}
        browseSortContext={pickerBrowseSortContext}
        budget={step.pickerWorkflowMode === 'purchase' ? budget : undefined}
        defaultTab="recommended"
        showCharacterPreview
        characterPreviewContext={characterPreviewContext}
        ownedPurchaseQuantities={ownedPurchaseQuantities}
        ownedGrantQuantities={step.ownedGrantQuantities}
        workflowMode={step.pickerWorkflowMode}
        workflowModes={step.pickerWorkflowModes}
        onWorkflowModeChange={step.setPickerWorkflowMode}
        isGoldShoppingPath={showShopping}
        resolveRowActionViewModel={pickerAcquisition.resolveRowActionViewModel}
        resolveGrantManageSources={pickerAcquisition.resolveGrantManageSources}
        draft={draft}
        context={step.context}
        catalogIndex={catalogIndex}
        onApplyMagicItemAcquisition={pickerAcquisition.handleApplyMagicItemAcquisition}
        onApplyPurchase={pickerAcquisition.handleApplyPurchase}
        onReleaseGrant={pickerAcquisition.handleReleaseGrant}
        onRemovePurchase={pickerAcquisition.handleRemovePurchase}
        onAddItem={handleAddItem}
        onRemoveFromInventory={handleRemoveFromInventory}
        onRemoveOneFromInventory={handleRemoveOneFromInventory}
      />

      <ConfirmDialog
        open={pendingSelection !== null}
        onOpenChange={(open) => {
          if (!open) setPendingSelection(null)
        }}
        headline={EQUIPMENT_STEP_SWITCH_CONFIRM_HEADLINE}
        headlineClassName={equipmentStepSwitchConfirmHeadlineClasses}
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

      {pendingPackageSwitch && packageSwitchEvaluation ? (
        <EquipmentPackageSwitchResolutionModal
          open
          catalogIndex={catalogIndex}
          evaluation={packageSwitchEvaluation}
          draftQuantitiesByPurchaseId={pendingPackageSwitch.draftQuantitiesByPurchaseId}
          commitErrorReason={pendingPackageSwitch.commitErrorReason}
          staleNotice={pendingPackageSwitch.staleNotice}
          isCommitting={isPackageSwitchCommitting}
          onOpenChange={(open) => {
            if (!open) dismissPackageSwitch()
          }}
          onDraftQuantityChange={handleDraftPackageSwitchQuantity}
          onConfirm={handleCommitPackageSwitch}
        />
      ) : null}
    </>
  )
}
