import { type Equipment } from '@rpg/contracts'

import {
  buildEquipmentDetailViewModel,
  EQUIPMENT_STAT_LABELS,
  EquipmentDetailMetadata,
  PICKER_DISCLOSURE_DESCRIPTION_SIZE,
} from '@/features/content'

import {
  resolveEquipmentPickerCharacterPreviewLines,
  type EquipmentPickerCharacterPreviewContext,
} from './equipment-picker-character-preview.lib'
import type { EquipmentOwnership } from '../../../../lib/equipment/equipment-ownership-index.lib'
import type {
  EquipmentBudgetSummary,
  EquipmentPickerItemState,
} from '../drawer/equipment-picker-drawer.types'
import { EquipmentPickerCharacterPreviewSection } from './equipment-picker-item-details-sections'
import { EquipmentPickerInventorySummary } from './equipment-picker-inventory-summary'
import {
  equipmentPickerItemDetailsPurchaseSectionClasses,
  equipmentPickerItemDetailsSectionClasses,
} from './equipment-picker-item-details.variants'

export type EquipmentPickerItemDetailsProps = {
  equipment: Equipment
  itemState: EquipmentPickerItemState
  budget?: EquipmentBudgetSummary
  ownership: EquipmentOwnership
  showCharacterPreview?: boolean
  characterPreviewContext?: EquipmentPickerCharacterPreviewContext
}

/** Expanded equipment picker body — metadata, optional character preview, ownership ledger. */
export function EquipmentPickerItemDetails({
  equipment,
  itemState,
  ownership,
  showCharacterPreview = false,
  characterPreviewContext,
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

  return (
    <div className={equipmentPickerItemDetailsSectionClasses}>
      <EquipmentDetailMetadata
        viewModel={detailViewModel}
        sectionId={`${equipment.id}-detail-metadata`}
        omitStatLabels={[EQUIPMENT_STAT_LABELS.kind, EQUIPMENT_STAT_LABELS.cost]}
        omitSectionTitle
        statRowSize="sm"
        descriptionSize={PICKER_DISCLOSURE_DESCRIPTION_SIZE}
      />

      {previewLines ? (
        <EquipmentPickerCharacterPreviewSection
          equipmentId={equipment.id}
          previewLines={previewLines}
        />
      ) : null}

      {ownership.totalQuantity > 0 ? (
        <div className={equipmentPickerItemDetailsPurchaseSectionClasses}>
          <EquipmentPickerInventorySummary equipmentId={equipment.id} ownership={ownership} />
        </div>
      ) : null}
    </div>
  )
}
