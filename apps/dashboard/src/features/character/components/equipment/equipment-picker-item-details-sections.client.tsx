'use client'

import { Button, Heading, Text } from '@rpg/ui'
import type { Equipment } from '@rpg/contracts'

import { EQUIPMENT_PICKER_CHARACTER_PREVIEW_SECTION_LABEL } from './equipment-picker-character-preview.lib'
import {
  EQUIPMENT_PICKER_PURCHASE_ADD_ANOTHER_LABEL,
  EQUIPMENT_PICKER_PURCHASE_ALREADY_OWNED_LABEL,
  EQUIPMENT_PICKER_PURCHASE_SECTION_LABEL,
  type EquipmentPickerPurchaseViewModel,
} from './equipment-picker-purchase.lib'
import { EquipmentPickerPurchaseSection } from './equipment-picker-purchase-section.client'

export type EquipmentPickerCharacterPreviewSectionProps = {
  equipmentId: string
  previewLines: string[]
}

export function EquipmentPickerCharacterPreviewSection({
  equipmentId,
  previewLines,
}: EquipmentPickerCharacterPreviewSectionProps) {
  if (previewLines.length === 0) return null

  return (
    <section aria-labelledby={`${equipmentId}-character-preview-heading`} className="space-y-2">
      <Heading variant="subsection" as="h3" id={`${equipmentId}-character-preview-heading`}>
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
  )
}

export type EquipmentPickerOwnedStackableSectionProps = {
  equipmentId: string
  ownedQuantity: number
  disabled: boolean
  onAddAnother?: () => void
}

export function EquipmentPickerOwnedStackableSection({
  equipmentId,
  ownedQuantity,
  disabled,
  onAddAnother,
}: EquipmentPickerOwnedStackableSectionProps) {
  return (
    <section aria-labelledby={`${equipmentId}-purchase-owned-heading`} className="space-y-3">
      <Heading variant="subsection" as="h3" id={`${equipmentId}-purchase-owned-heading`}>
        {EQUIPMENT_PICKER_PURCHASE_SECTION_LABEL}
      </Heading>
      <Text variant="muted">
        {EQUIPMENT_PICKER_PURCHASE_ALREADY_OWNED_LABEL}: {ownedQuantity}
      </Text>
      {onAddAnother ? (
        <Button type="button" size="sm" disabled={disabled} onClick={onAddAnother}>
          {EQUIPMENT_PICKER_PURCHASE_ADD_ANOTHER_LABEL}
        </Button>
      ) : null}
    </section>
  )
}

export type EquipmentPickerOwnedUniqueSectionProps = {
  equipmentId: string
  ownedQuantity: number
}

export function EquipmentPickerOwnedUniqueSection({
  equipmentId,
  ownedQuantity,
}: EquipmentPickerOwnedUniqueSectionProps) {
  return (
    <section aria-labelledby={`${equipmentId}-purchase-owned-heading`} className="space-y-2">
      <Heading variant="subsection" as="h3" id={`${equipmentId}-purchase-owned-heading`}>
        {EQUIPMENT_PICKER_PURCHASE_SECTION_LABEL}
      </Heading>
      <Text variant="muted">
        {EQUIPMENT_PICKER_PURCHASE_ALREADY_OWNED_LABEL}: {ownedQuantity}
      </Text>
    </section>
  )
}

export type EquipmentPickerNewPurchaseSectionProps = {
  equipment: Equipment
  viewModel: Extract<EquipmentPickerPurchaseViewModel, { mode: 'new' }>
  bundleLabel?: string
  disabled: boolean
  onAddQuantityChange: (quantity: number) => void
  onCommit: () => void
}

export function EquipmentPickerNewPurchaseSection({
  equipment,
  viewModel,
  bundleLabel,
  disabled,
  onAddQuantityChange,
  onCommit,
}: EquipmentPickerNewPurchaseSectionProps) {
  return (
    <EquipmentPickerPurchaseSection
      equipmentName={equipment.name}
      bundleLabel={bundleLabel}
      viewModel={viewModel}
      disabled={disabled}
      onQuantityChange={onAddQuantityChange}
      onCommit={onCommit}
    />
  )
}

export type EquipmentPickerPurchasePanelProps = {
  equipment: Equipment
  ownedQuantity: number
  stackable: boolean
  disabled: boolean
  bundleLabel?: string
  purchaseViewModel?: EquipmentPickerPurchaseViewModel
  onAddQuantityChange: (quantity: number) => void
  onCommit: () => void
  onAddAnother?: () => void
}

export function EquipmentPickerPurchasePanel({
  equipment,
  ownedQuantity,
  stackable,
  disabled,
  bundleLabel,
  purchaseViewModel,
  onAddQuantityChange,
  onCommit,
  onAddAnother,
}: EquipmentPickerPurchasePanelProps) {
  if (ownedQuantity > 0 && stackable) {
    return (
      <EquipmentPickerOwnedStackableSection
        equipmentId={equipment.id}
        ownedQuantity={ownedQuantity}
        disabled={disabled}
        onAddAnother={onAddAnother}
      />
    )
  }

  if (ownedQuantity > 0) {
    return (
      <EquipmentPickerOwnedUniqueSection equipmentId={equipment.id} ownedQuantity={ownedQuantity} />
    )
  }

  if (purchaseViewModel?.mode === 'new') {
    return (
      <EquipmentPickerNewPurchaseSection
        equipment={equipment}
        viewModel={purchaseViewModel}
        bundleLabel={bundleLabel}
        disabled={disabled}
        onAddQuantityChange={onAddQuantityChange}
        onCommit={onCommit}
      />
    )
  }

  return null
}
