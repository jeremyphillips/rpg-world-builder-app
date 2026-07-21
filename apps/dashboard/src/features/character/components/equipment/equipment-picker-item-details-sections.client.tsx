'use client'

import { Button, Heading } from '@rpg/ui'
import type { Equipment } from '@rpg/contracts'

import { EquipmentInventorySourceActionButton } from './equipment-inventory-source-action-button.client'

import { EQUIPMENT_PICKER_CHARACTER_PREVIEW_SECTION_LABEL } from './equipment-picker-character-preview.lib'
import {
  EQUIPMENT_PICKER_PURCHASE_INVENTORY_LABEL,
  EQUIPMENT_PICKER_PURCHASE_REMOVE_ALL_LABEL,
  EQUIPMENT_PICKER_PURCHASE_REMOVE_ONE_LABEL,
  EQUIPMENT_PICKER_PURCHASE_SECTION_LABEL,
  type EquipmentPickerPurchaseViewModel,
} from './equipment-picker-purchase.lib'
import { EquipmentPickerPurchaseSection } from './equipment-picker-purchase-section.client'
import {
  EquipmentPickerPurchaseDetailsRows,
  PurchaseRow,
} from './equipment-picker-purchase-rows.client'
import {
  equipmentPickerPurchaseInsetPanelClasses,
  equipmentPickerPurchaseInsetPanelContentClasses,
  equipmentPickerPurchaseRemoveActionsClasses,
} from './equipment-picker-purchase.variants'

export { EquipmentPickerGrantPanel } from './equipment-picker-grant-panel.client'
export type { EquipmentPickerGrantManageSource } from './equipment-picker-grant.lib'

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
    <section aria-labelledby={`${equipmentId}-character-preview-heading`} className="space-y-3">
      <Heading variant="subsection" as="h3" id={`${equipmentId}-character-preview-heading`}>
        {EQUIPMENT_PICKER_CHARACTER_PREVIEW_SECTION_LABEL}
      </Heading>
      <ul className="space-y-1" role="list">
        {previewLines.map((line) => (
          <li key={line}>
            <span className="text-sm text-muted-foreground">{line}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

function InventoryRemoveTextButton({
  label,
  onClick,
  disabled,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <EquipmentInventorySourceActionButton disabled={disabled} onClick={onClick}>
      {label}
    </EquipmentInventorySourceActionButton>
  )
}

export type EquipmentPickerOwnedStackableSectionProps = {
  equipment: Equipment
  viewModel: Extract<EquipmentPickerPurchaseViewModel, { mode: 'owned' }>
  disabled: boolean
  onAddQuantityChange: (quantity: number) => void
  onCommit: () => void
  onRemoveOneFromInventory?: () => void
  onRemoveFromInventory?: () => void
}

export function EquipmentPickerOwnedStackableSection({
  equipment,
  viewModel,
  disabled,
  onAddQuantityChange,
  onCommit,
  onRemoveOneFromInventory,
  onRemoveFromInventory,
}: EquipmentPickerOwnedStackableSectionProps) {
  const showRemoveOne = viewModel.ownedQuantity > 1 && onRemoveOneFromInventory

  return (
    <section aria-labelledby={`${equipment.id}-purchase-owned-heading`} className="space-y-3">
      <Heading variant="group" as="h3" id={`${equipment.id}-purchase-owned-heading`}>
        {EQUIPMENT_PICKER_PURCHASE_SECTION_LABEL}
      </Heading>

      <div className={equipmentPickerPurchaseInsetPanelClasses}>
        <div className={equipmentPickerPurchaseInsetPanelContentClasses}>
          <PurchaseRow
            label={EQUIPMENT_PICKER_PURCHASE_INVENTORY_LABEL}
            value={String(viewModel.ownedQuantity)}
          />

          {showRemoveOne || onRemoveFromInventory ? (
            <div className={equipmentPickerPurchaseRemoveActionsClasses}>
              {showRemoveOne ? (
                <InventoryRemoveTextButton
                  label={EQUIPMENT_PICKER_PURCHASE_REMOVE_ONE_LABEL}
                  disabled={disabled}
                  onClick={onRemoveOneFromInventory}
                />
              ) : null}
              {onRemoveFromInventory ? (
                <InventoryRemoveTextButton
                  label={EQUIPMENT_PICKER_PURCHASE_REMOVE_ALL_LABEL}
                  disabled={disabled}
                  onClick={onRemoveFromInventory}
                />
              ) : null}
            </div>
          ) : null}

          <EquipmentPickerPurchaseDetailsRows
            equipmentName={equipment.name}
            viewModel={viewModel}
            disabled={disabled}
            onQuantityChange={onAddQuantityChange}
          />

          <Button type="button" size="sm" disabled={disabled} onClick={onCommit}>
            {viewModel.commitLabel}
          </Button>
        </div>
      </div>
    </section>
  )
}

export type EquipmentPickerOwnedUniqueSectionProps = {
  equipmentId: string
  ownedQuantity: number
  disabled?: boolean
  onRemoveFromInventory?: () => void
}

export function EquipmentPickerOwnedUniqueSection({
  equipmentId,
  ownedQuantity,
  disabled = false,
  onRemoveFromInventory,
}: EquipmentPickerOwnedUniqueSectionProps) {
  return (
    <section aria-labelledby={`${equipmentId}-purchase-owned-heading`} className="space-y-3">
      <Heading variant="group" as="h3" id={`${equipmentId}-purchase-owned-heading`}>
        {EQUIPMENT_PICKER_PURCHASE_SECTION_LABEL}
      </Heading>

      <div className={equipmentPickerPurchaseInsetPanelClasses}>
        <div className={equipmentPickerPurchaseInsetPanelContentClasses}>
          <PurchaseRow
            label={EQUIPMENT_PICKER_PURCHASE_INVENTORY_LABEL}
            value={String(ownedQuantity)}
          />

          {onRemoveFromInventory ? (
            <div className={equipmentPickerPurchaseRemoveActionsClasses}>
              <InventoryRemoveTextButton
                label={EQUIPMENT_PICKER_PURCHASE_REMOVE_ALL_LABEL}
                disabled={disabled}
                onClick={onRemoveFromInventory}
              />
            </div>
          ) : null}
        </div>
      </div>
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
  onRemoveFromInventory?: () => void
  onRemoveOneFromInventory?: () => void
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
  onRemoveFromInventory,
  onRemoveOneFromInventory,
}: EquipmentPickerPurchasePanelProps) {
  if (purchaseViewModel?.mode === 'owned' && stackable) {
    return (
      <EquipmentPickerOwnedStackableSection
        equipment={equipment}
        viewModel={purchaseViewModel}
        disabled={disabled}
        onAddQuantityChange={onAddQuantityChange}
        onCommit={onCommit}
        onRemoveFromInventory={onRemoveFromInventory}
        onRemoveOneFromInventory={onRemoveOneFromInventory}
      />
    )
  }

  if (ownedQuantity > 0) {
    return (
      <EquipmentPickerOwnedUniqueSection
        equipmentId={equipment.id}
        ownedQuantity={ownedQuantity}
        disabled={disabled}
        onRemoveFromInventory={onRemoveFromInventory}
      />
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
