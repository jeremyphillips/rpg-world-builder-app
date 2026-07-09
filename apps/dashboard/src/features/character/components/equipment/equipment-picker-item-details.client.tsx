'use client'

import { Heading, Text } from '@rpg/ui'
import type { Equipment } from '@rpg/contracts'

import {
  buildEquipmentDetailViewModel,
  EQUIPMENT_STAT_LABELS,
  EquipmentDetailMetadata,
} from '@/features/content'

import {
  EQUIPMENT_PICKER_CHARACTER_PREVIEW_SECTION_LABEL,
  resolveEquipmentPickerCharacterPreviewLines,
  type EquipmentPickerCharacterPreviewContext,
} from './equipment-picker-character-preview.lib'
import {
  buildEquipmentPickerPurchaseViewModel,
  EQUIPMENT_PICKER_PURCHASE_ALREADY_OWNED_LABEL,
  EQUIPMENT_PICKER_PURCHASE_SECTION_LABEL,
} from './equipment-picker-purchase.lib'
import { EquipmentPickerPurchaseSection } from './equipment-picker-purchase-section.client'
import type {
  EquipmentBudgetSummary,
  EquipmentPickerItem,
  EquipmentPickerItemState,
} from './equipment-picker-drawer.types'
import { isEquipmentPickerItemDisabled } from './equipment-picker-drawer.lib'
import { equipmentPickerItemDetailsSectionClasses } from './equipment-picker-item-details.variants'

export type EquipmentPickerItemDetailsProps = {
  equipment: Equipment
  itemState: EquipmentPickerItemState
  budget?: EquipmentBudgetSummary
  ownedQuantity: number
  addQuantity: number
  onAddQuantityChange: (quantity: number) => void
  onCommit: () => void
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
        omitStatLabels={[EQUIPMENT_STAT_LABELS.kind, EQUIPMENT_STAT_LABELS.cost]}
      />

      {previewLines && previewLines.length > 0 ? (
        <section
          aria-labelledby={`${equipment.id}-character-preview-heading`}
          className="space-y-2"
        >
          <Heading variant="subsection" as="h3" id={`${equipment.id}-character-preview-heading`}>
            {EQUIPMENT_PICKER_CHARACTER_PREVIEW_SECTION_LABEL}
          </Heading>
          <ul className="space-y-1" role="list">
            {previewLines.map((line) => (
              <li key={line}>
                <Text variant="muted">{line}</Text>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {ownedQuantity > 0 ? (
        <section aria-labelledby={`${equipment.id}-purchase-owned-heading`} className="space-y-2">
          <Heading variant="subsection" as="h3" id={`${equipment.id}-purchase-owned-heading`}>
            {EQUIPMENT_PICKER_PURCHASE_SECTION_LABEL}
          </Heading>
          <Text variant="muted">
            {EQUIPMENT_PICKER_PURCHASE_ALREADY_OWNED_LABEL}: {ownedQuantity}
          </Text>
        </section>
      ) : purchaseViewModel?.mode === 'new' ? (
        <EquipmentPickerPurchaseSection
          equipmentName={equipment.name}
          viewModel={purchaseViewModel}
          disabled={disabled}
          onQuantityChange={onAddQuantityChange}
          onCommit={onCommit}
        />
      ) : null}
    </div>
  )
}
