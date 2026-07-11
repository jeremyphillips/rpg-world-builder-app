'use client'

import { isEquipmentStackable, formatEquipmentBundleLabel, type Equipment } from '@rpg/contracts'

import {
  buildEquipmentDetailViewModel,
  EQUIPMENT_STAT_LABELS,
  EquipmentDetailMetadata,
} from '@/features/content'

import {
  resolveEquipmentPickerCharacterPreviewLines,
  type EquipmentPickerCharacterPreviewContext,
} from './equipment-picker-character-preview.lib'
import { buildEquipmentPickerPurchaseViewModel } from './equipment-picker-purchase.lib'
import type {
  EquipmentBudgetSummary,
  EquipmentPickerItem,
  EquipmentPickerItemState,
} from './equipment-picker-drawer.types'
import { isEquipmentPickerItemDisabled } from './equipment-picker-drawer.lib'
import {
  EquipmentPickerCharacterPreviewSection,
  EquipmentPickerPurchasePanel,
} from './equipment-picker-item-details-sections.client'
import { equipmentPickerItemDetailsSectionClasses } from './equipment-picker-item-details.variants'

export type EquipmentPickerItemDetailsProps = {
  equipment: Equipment
  itemState: EquipmentPickerItemState
  budget?: EquipmentBudgetSummary
  ownedQuantity: number
  addQuantity: number
  onAddQuantityChange: (quantity: number) => void
  onCommit: () => void
  onAddAnother?: () => void
  showCharacterPreview?: boolean
  characterPreviewContext?: EquipmentPickerCharacterPreviewContext
}

/** Expanded equipment picker body — metadata, optional character preview, and purchase review. */
export function EquipmentPickerItemDetails({
  equipment,
  itemState,
  budget,
  ownedQuantity,
  addQuantity,
  onAddQuantityChange,
  onCommit,
  onAddAnother,
  showCharacterPreview = false,
  characterPreviewContext,
}: EquipmentPickerItemDetailsProps) {
  const detailViewModel = buildEquipmentDetailViewModel(equipment)
  const pickerItem = { equipment, state: itemState, searchText: '' } satisfies EquipmentPickerItem
  const disabled = isEquipmentPickerItemDisabled(pickerItem)
  const previewContext =
    showCharacterPreview && characterPreviewContext
      ? { ...characterPreviewContext, budget: undefined }
      : undefined
  const previewLines =
    previewContext &&
    resolveEquipmentPickerCharacterPreviewLines(equipment, previewContext, {
      isProficient: itemState.isProficient,
    })
  const purchaseViewModel = buildEquipmentPickerPurchaseViewModel({
    equipment,
    quantity: addQuantity,
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
      />

      {previewLines ? (
        <EquipmentPickerCharacterPreviewSection
          equipmentId={equipment.id}
          previewLines={previewLines}
        />
      ) : null}

      <EquipmentPickerPurchasePanel
        equipment={equipment}
        ownedQuantity={ownedQuantity}
        stackable={isEquipmentStackable(equipment)}
        disabled={disabled}
        bundleLabel={formatEquipmentBundleLabel(equipment)}
        purchaseViewModel={purchaseViewModel}
        onAddQuantityChange={onAddQuantityChange}
        onCommit={onCommit}
        onAddAnother={onAddAnother}
      />
    </div>
  )
}
