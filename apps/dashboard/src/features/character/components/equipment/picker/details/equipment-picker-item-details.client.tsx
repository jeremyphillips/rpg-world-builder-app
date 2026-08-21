'use client'

import { type Equipment } from '@rpg/contracts'

import {
  buildEquipmentDetailViewModel,
  EQUIPMENT_STAT_LABELS,
  EquipmentDetailMetadata,
} from '@/features/content'

import {
  resolveEquipmentPickerCharacterPreviewLines,
  type EquipmentPickerCharacterPreviewContext,
} from './equipment-picker-character-preview.lib'
import { EquipmentPickerAcquisitionPanel } from '../purchase/equipment-picker-acquisition-panel.client'
import type { EquipmentPickerRowActionViewModel } from '../equipment-picker-action.lib'
import {
  buildEquipmentPickerItemDetailsViewModels,
  resolveEquipmentPickerItemDetailsDisabled,
} from './equipment-picker-item-details.lib'
import type {
  EquipmentBudgetSummary,
  EquipmentPickerDrawerProps,
  EquipmentPickerItemState,
} from '../drawer/equipment-picker-drawer.types'
import {
  EquipmentPickerCharacterPreviewSection,
  type EquipmentPickerGrantManageSource,
} from './equipment-picker-item-details-sections.client'
import {
  equipmentPickerItemDetailsPurchaseSectionClasses,
  equipmentPickerItemDetailsSectionClasses,
} from './equipment-picker-item-details.variants'

export type EquipmentPickerItemDetailsProps = {
  equipment: Equipment
  itemState: EquipmentPickerItemState
  budget?: EquipmentBudgetSummary
  ownedQuantity: number
  addQuantity: number
  onAddQuantityChange: (quantity: number) => void
  onCommit: () => void
  onRemoveFromInventory?: () => void
  onRemoveOneFromInventory?: () => void
  showCharacterPreview?: boolean
  characterPreviewContext?: EquipmentPickerCharacterPreviewContext
  rowActionVm?: EquipmentPickerRowActionViewModel
  manageSources?: EquipmentPickerGrantManageSource
  grantAcquisitionContext?: EquipmentPickerDrawerProps['grantAcquisitionContext']
  onApplyMagicItemAcquisition?: (requestedQuantity: number) => boolean
  onReleaseGrant?: (args: { allowanceId: string; equipmentId: string; quantity: number }) => void
  onRemovePurchase?: (args: { purchaseId: string; quantity: number }) => void
}

/** Expanded equipment picker body — metadata, optional character preview, and acquisition panel. */
export function EquipmentPickerItemDetails({
  equipment,
  itemState,
  budget,
  ownedQuantity,
  addQuantity,
  onAddQuantityChange,
  onCommit,
  onRemoveFromInventory,
  onRemoveOneFromInventory,
  showCharacterPreview = false,
  characterPreviewContext,
  rowActionVm,
  manageSources,
  grantAcquisitionContext,
  onApplyMagicItemAcquisition,
  onReleaseGrant,
  onRemovePurchase,
}: EquipmentPickerItemDetailsProps) {
  const detailViewModel = buildEquipmentDetailViewModel(equipment)
  const previewContext =
    showCharacterPreview && characterPreviewContext
      ? { ...characterPreviewContext, budget: undefined }
      : undefined
  const previewLines =
    previewContext &&
    resolveEquipmentPickerCharacterPreviewLines(equipment, previewContext, {
      isProficient: itemState.isProficient,
    })
  const purchaseDisabled = resolveEquipmentPickerItemDetailsDisabled({ rowActionVm, itemState })
  const { purchaseViewModel, grantViewModel } = buildEquipmentPickerItemDetailsViewModels({
    equipment,
    rowActionVm,
    addQuantity,
    budget,
    ownedQuantity,
  })

  return (
    <div className={equipmentPickerItemDetailsSectionClasses}>
      <EquipmentDetailMetadata
        viewModel={detailViewModel}
        sectionId={`${equipment.id}-detail-metadata`}
        omitStatLabels={[EQUIPMENT_STAT_LABELS.kind, EQUIPMENT_STAT_LABELS.cost]}
        omitSectionTitle
        statRowSize="sm"
      />

      {previewLines ? (
        <EquipmentPickerCharacterPreviewSection
          equipmentId={equipment.id}
          previewLines={previewLines}
        />
      ) : null}

      <div className={equipmentPickerItemDetailsPurchaseSectionClasses}>
        <EquipmentPickerAcquisitionPanel
          equipment={equipment}
          rowActionVm={rowActionVm}
          manageSources={manageSources}
          grantAcquisitionContext={grantAcquisitionContext}
          budget={budget}
          purchaseViewModel={purchaseViewModel}
          grantViewModel={grantViewModel}
          ownedQuantity={ownedQuantity}
          purchaseDisabled={purchaseDisabled}
          addQuantity={addQuantity}
          onAddQuantityChange={onAddQuantityChange}
          onCommit={onCommit}
          onApplyMagicItemAcquisition={onApplyMagicItemAcquisition}
          onReleaseGrant={onReleaseGrant}
          onRemovePurchase={onRemovePurchase}
          onRemoveFromInventory={onRemoveFromInventory}
          onRemoveOneFromInventory={onRemoveOneFromInventory}
        />
      </div>
    </div>
  )
}
