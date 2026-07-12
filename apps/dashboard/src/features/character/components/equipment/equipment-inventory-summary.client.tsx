'use client'

import { useMemo } from 'react'

import type { CharacterBuildCatalogIndex, CharacterBuilderDraft } from '@rpg/contracts'
import { Text } from '@rpg/ui'

import type {
  EquipmentInventoryQuantityTarget,
  EquipmentInventoryRemoveTarget,
} from '../../lib/equipment-step.lib'
import { EquipmentPurchasedInventoryColumn } from './equipment-purchased-inventory-column.client'
import { EquipmentStartingPackageSection } from './equipment-starting-package-section.client'
import {
  buildEquipmentInventoryLayout,
  shouldRenderEquipmentInventorySummary,
} from './equipment-inventory-summary.lib'
import {
  equipmentInventorySummaryClasses,
  equipmentInventorySummaryGridClasses,
} from './equipment-inventory-summary.variants'

export type EquipmentInventorySummaryProps = {
  draft: CharacterBuilderDraft
  catalogIndex: CharacterBuildCatalogIndex
  conversionEditorOpen?: boolean
  selectedPackageItemKeys?: ReadonlySet<string>
  conversionCommitStatusMessage?: string
  onRemoveItem?: (target: EquipmentInventoryRemoveTarget) => void
  onSetPurchaseQuantity?: (target: EquipmentInventoryQuantityTarget, quantity: number) => void
  onCustomizePackage?: () => void
  onChangeEquipmentOption?: () => void
  onSelectedPackageItemKeysChange?: (keys: ReadonlySet<string>) => void
  onCancelConversion?: () => void
  onCommitConversion?: (preview: import('@rpg/contracts').StartingPackageConversionPreview) => void
  showBrowseEquipment?: boolean
  onOpenPicker?: () => void
}

export function EquipmentInventorySummary({
  draft,
  catalogIndex,
  conversionEditorOpen = false,
  selectedPackageItemKeys = new Set(),
  conversionCommitStatusMessage,
  onRemoveItem,
  onSetPurchaseQuantity,
  onCustomizePackage,
  onChangeEquipmentOption,
  onSelectedPackageItemKeysChange,
  onCancelConversion,
  onCommitConversion,
  showBrowseEquipment = false,
  onOpenPicker,
}: EquipmentInventorySummaryProps) {
  const layout = useMemo(
    () => buildEquipmentInventoryLayout(draft, catalogIndex),
    [catalogIndex, draft],
  )

  if (!shouldRenderEquipmentInventorySummary(layout, showBrowseEquipment)) {
    return <Text variant="muted">No equipment selected yet.</Text>
  }

  const isPackageMode = layout.mode === 'package'

  return (
    <div
      className={
        isPackageMode ? equipmentInventorySummaryGridClasses : equipmentInventorySummaryClasses
      }
    >
      {isPackageMode ? (
        <EquipmentStartingPackageSection
          packageGroup={layout.startingPackage}
          draft={draft}
          catalogIndex={catalogIndex}
          conversionEditorOpen={conversionEditorOpen}
          selectedPackageItemKeys={selectedPackageItemKeys}
          commitStatusMessage={conversionCommitStatusMessage}
          onCustomize={onCustomizePackage ?? (() => undefined)}
          onChangeEquipmentOption={onChangeEquipmentOption ?? (() => undefined)}
          onSelectedPackageItemKeysChange={onSelectedPackageItemKeysChange ?? (() => undefined)}
          onCancelConversion={onCancelConversion ?? (() => undefined)}
          onCommitConversion={onCommitConversion ?? (() => undefined)}
        />
      ) : null}

      <EquipmentPurchasedInventoryColumn
        purchased={layout.purchased}
        isPackageMode={isPackageMode}
        showBrowseEquipment={showBrowseEquipment}
        onOpenPicker={onOpenPicker}
        onRemoveItem={onRemoveItem}
        onSetPurchaseQuantity={onSetPurchaseQuantity}
      />
    </div>
  )
}
