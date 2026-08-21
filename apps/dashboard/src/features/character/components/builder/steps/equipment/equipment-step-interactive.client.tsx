'use client'

import { ConfirmDialog } from '@rpg/ui'

import type { BuilderStepReadinessState } from '@rpg/contracts'

import {
  EQUIPMENT_STEP_SWITCH_CONFIRM_DESCRIPTION,
  EQUIPMENT_STEP_SWITCH_CONFIRM_HEADLINE,
} from '../../../../lib/equipment/equipment-step.lib'
import { showsBuilderStepReviewMessage } from '../../../../lib/builder/builder-step-readiness.lib'
import { EquipmentAcquisitionGuidance } from '../../../equipment/acquisition/equipment-acquisition-guidance.client'
import { EquipmentPackageSwitchResolutionModal } from '../../../equipment/package-switch/equipment-package-switch-resolution-modal.client'
import { EquipmentPickerDrawer } from '../../../equipment/picker/drawer/equipment-picker-drawer.client'
import { StartingEquipmentOptionSection } from '../../../equipment/starting-package/starting-equipment-option-section.client'
import { equipmentStepSwitchConfirmHeadlineClasses } from './equipment-step-interactive.variants'
import {
  EquipmentStepFallback,
  EquipmentStepInventorySection,
  EquipmentStepReplacedClassOptionsNotice,
} from './equipment-step-sections.client'
import { BuilderStepReadinessPanel } from '../shared/builder-step-readiness-panel.client'
import type { EquipmentStepProps } from './equipment-step.types'
import type { useEquipmentStep } from '../../../../hooks/use-equipment-step.client'
import { useEquipmentPickerAcquisition } from '../../../../hooks/use-equipment-picker-acquisition.client'

type EquipmentStepInteractiveProps = Pick<EquipmentStepProps, 'draft' | 'onDraftChange'> & {
  step: ReturnType<typeof useEquipmentStep>
  readiness: BuilderStepReadinessState
}

type EquipmentStepModel = ReturnType<typeof useEquipmentStep>

function EquipmentStepStartingOptions({
  draft,
  step,
}: {
  draft: EquipmentStepInteractiveProps['draft']
  step: EquipmentStepModel
}) {
  if (step.classOptionsReplaced) {
    return <EquipmentStepReplacedClassOptionsNotice tierLabel={step.tierLabel} />
  }

  if (step.showFallback) {
    return <EquipmentStepFallback onContinueWithout={step.skipStartingEquipment} />
  }

  if (step.equipmentChoiceSets.length === 0 || step.summaries.length === 0) {
    return null
  }

  return (
    <StartingEquipmentOptionSection
      characterClass={step.characterClass!}
      catalogIndex={step.catalogIndex}
      summaries={step.summaries}
      draft={draft}
      resolvedChoiceSets={step.resolvedChoiceSets}
      selectedOptionId={step.selectedOptionId}
      isPackageChooserExpanded={step.isPackageChooserExpanded}
      onSelectOption={step.requestSelection}
      onNestedPoolChange={step.onNestedPoolChange}
      onChoiceSelectionChange={step.onChoiceSelectionChange}
      onChangePackage={step.expandPackageChooser}
      onCollapseChooser={step.collapsePackageChooser}
    />
  )
}

function scrollToStartingEquipmentOptions() {
  const el = document.getElementById('starting-equipment-options')
  el?.scrollIntoView?.({ behavior: 'smooth', block: 'start' })
  el?.focus()
}

export function EquipmentStepInteractive({
  draft,
  onDraftChange,
  step,
  readiness,
}: EquipmentStepInteractiveProps) {
  const {
    catalogIndex,
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
    handleAddItem,
    handleSetPurchaseQuantity,
    handleRemoveFromInventory,
    handleRemoveOneFromInventory,
    applySelection,
    onRemoveItem,
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

        <EquipmentStepStartingOptions draft={draft} step={step} />

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
            scrollToStartingEquipmentOptions()
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
        showCharacterPreview
        characterPreviewContext={characterPreviewContext}
        ownedPurchaseQuantities={ownedPurchaseQuantities}
        ownedGrantQuantities={step.ownedGrantQuantities}
        workflowMode={step.pickerWorkflowMode}
        workflowModes={step.pickerWorkflowModes}
        onWorkflowModeChange={step.setPickerWorkflowMode}
        magicItemGrantProgress={step.showMagicItemGrants ? step.acquisition.progress : undefined}
        focusedAllowanceId={step.focusedAllowanceId}
        onFocusedAllowanceIdChange={step.setFocusedAllowanceId}
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
