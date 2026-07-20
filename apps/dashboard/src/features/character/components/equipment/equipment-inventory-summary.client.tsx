'use client'

import { useMemo } from 'react'

import type {
  CharacterBuildCatalogIndex,
  CharacterBuildContext,
  CharacterBuilderDraft,
  ClassOptionPolicy,
  EquipmentBudgetSummary,
  ResolvedStartingEquipmentFunding,
} from '@rpg/contracts'
import { Text } from '@rpg/ui'

import type {
  EquipmentInventoryQuantityTarget,
  EquipmentInventoryRemoveTarget,
} from '../../lib/equipment-step.lib'
import { EquipmentMagicItemsInventoryColumn } from './equipment-magic-items-inventory-column.client'
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
  context?: CharacterBuildContext
  budget?: EquipmentBudgetSummary
  goldOptionFunding?: ResolvedStartingEquipmentFunding
  classOptionPolicy?: ClassOptionPolicy
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
  showMagicItemGrants?: boolean
  onOpenMagicItemsPicker?: () => void
}

export function EquipmentInventorySummary({
  draft,
  catalogIndex,
  context,
  budget,
  goldOptionFunding,
  classOptionPolicy = 'included',
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
  showMagicItemGrants = false,
  onOpenMagicItemsPicker,
}: EquipmentInventorySummaryProps) {
  const layout = useMemo(
    () => buildEquipmentInventoryLayout(draft, catalogIndex, budget, classOptionPolicy, context),
    [budget, catalogIndex, classOptionPolicy, context, draft],
  )

  if (!shouldRenderEquipmentInventorySummary(layout, showBrowseEquipment || showMagicItemGrants)) {
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
          goldOptionFunding={goldOptionFunding}
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

      <EquipmentMagicItemsInventoryColumn
        magicItems={layout.magicItems}
        showChooseMagicItems={showMagicItemGrants}
        onOpenMagicItemsPicker={onOpenMagicItemsPicker}
        onRemoveItem={onRemoveItem}
        onSetPurchaseQuantity={onSetPurchaseQuantity}
      />

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
