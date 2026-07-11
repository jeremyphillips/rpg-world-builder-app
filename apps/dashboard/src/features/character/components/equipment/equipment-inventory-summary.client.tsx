'use client'

import { useMemo } from 'react'

import type { CharacterBuildCatalogIndex, CharacterBuilderDraft } from '@rpg/contracts'
import { Heading, Text } from '@rpg/ui'

import {
  EQUIPMENT_PURCHASED_INVENTORY_SECTION_LABEL,
  EQUIPMENT_STARTING_PACKAGE_SECTION_LABEL,
  type EquipmentInventoryQuantityTarget,
  type EquipmentInventoryRemoveTarget,
} from '../../lib/equipment-step.lib'
import { EquipmentPurchasedInventorySection } from './equipment-purchased-inventory-section.client'
import { EquipmentStartingPackageSection } from './equipment-starting-package-section.client'
import {
  buildEquipmentInventoryLayout,
  type EquipmentInventoryLayout,
} from './equipment-inventory-summary.lib'
import { equipmentInventorySummaryClasses } from './equipment-inventory-summary.variants'

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
  onRemoveFromPackage?: (packageItemKey: string) => void
  onSelectedPackageItemKeysChange?: (keys: ReadonlySet<string>) => void
  onCancelConversion?: () => void
  onCommitConversion?: (preview: import('@rpg/contracts').StartingPackageConversionPreview) => void
}

function hasInventoryContent(layout: EquipmentInventoryLayout): boolean {
  if (layout.mode === 'gold') {
    return layout.purchased.some((group) => group.displays.length > 0)
  }

  return (
    layout.startingPackage.categoryGroups.some((group) => group.rows.length > 0) ||
    layout.purchased.some((group) => group.displays.length > 0)
  )
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
  onRemoveFromPackage,
  onSelectedPackageItemKeysChange,
  onCancelConversion,
  onCommitConversion,
}: EquipmentInventorySummaryProps) {
  const layout = useMemo(
    () => buildEquipmentInventoryLayout(draft, catalogIndex),
    [catalogIndex, draft],
  )

  if (!layout || !hasInventoryContent(layout)) {
    return <Text variant="muted">No equipment selected yet.</Text>
  }

  return (
    <div className={equipmentInventorySummaryClasses}>
      {layout.mode === 'package' ? (
        <section className="space-y-3">
          <Heading variant="subsection" as="h3">
            {EQUIPMENT_STARTING_PACKAGE_SECTION_LABEL}
          </Heading>
          <EquipmentStartingPackageSection
            packageGroup={layout.startingPackage}
            draft={draft}
            catalogIndex={catalogIndex}
            conversionEditorOpen={conversionEditorOpen}
            selectedPackageItemKeys={selectedPackageItemKeys}
            commitStatusMessage={conversionCommitStatusMessage}
            onCustomize={onCustomizePackage ?? (() => undefined)}
            onChangeEquipmentOption={onChangeEquipmentOption ?? (() => undefined)}
            onRemoveFromPackage={onRemoveFromPackage ?? (() => undefined)}
            onSelectedPackageItemKeysChange={onSelectedPackageItemKeysChange ?? (() => undefined)}
            onCancelConversion={onCancelConversion ?? (() => undefined)}
            onCommitConversion={onCommitConversion ?? (() => undefined)}
          />
        </section>
      ) : null}

      <section className="space-y-3">
        <Heading variant="subsection" as="h3">
          {EQUIPMENT_PURCHASED_INVENTORY_SECTION_LABEL}
        </Heading>
        <EquipmentPurchasedInventorySection
          purchased={layout.purchased}
          onRemoveItem={onRemoveItem}
          onSetPurchaseQuantity={onSetPurchaseQuantity}
        />
      </section>
    </div>
  )
}
