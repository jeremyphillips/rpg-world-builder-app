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
import { Heading, Text } from '@rpg/ui'

import {
  EQUIPMENT_STARTING_PACKAGE_SECTION_LABEL,
  type EquipmentInventoryQuantityTarget,
  type EquipmentInventoryRemoveTarget,
} from '../../lib/equipment/equipment-step.lib'
import { EquipmentAddedInventoryColumn } from './equipment-added-inventory-column.client'
import { EquipmentInventoryColumn } from './equipment-inventory-column.client'
import { EquipmentStartingPackageSection } from './equipment-starting-package-section.client'
import { buildEquipmentInventoryViewModel } from './equipment-inventory-summary.lib'
import {
  equipmentGoldOptionPanelClasses,
  equipmentInventorySummaryGridClasses,
} from './equipment-inventory-summary.variants'

export type EquipmentInventorySummaryProps = {
  draft: CharacterBuilderDraft
  catalogIndex: CharacterBuildCatalogIndex
  context: CharacterBuildContext
  budget?: EquipmentBudgetSummary
  goldOptionFunding?: ResolvedStartingEquipmentFunding
  classOptionPolicy?: ClassOptionPolicy
  conversionEditorOpen?: boolean
  selectedPackageItemKeys?: ReadonlySet<string>
  conversionCommitStatusMessage?: string
  onRemoveItem?: (target: EquipmentInventoryRemoveTarget) => void
  onSetPurchaseQuantity?: (target: EquipmentInventoryQuantityTarget, quantity: number) => void
  onReleaseGrant?: (args: { allowanceId: string; equipmentId: string; quantity: number }) => void
  onRemovePurchase?: (args: { purchaseId: string; quantity: number }) => void
  onApplyMagicItemAcquisition?: (args: {
    equipmentId: string
    requestedQuantity: number
  }) => boolean
  onCustomizePackage?: () => void
  onChangeEquipmentOption?: () => void
  onSelectedPackageItemKeysChange?: (keys: ReadonlySet<string>) => void
  onCancelConversion?: () => void
  onCommitConversion?: (preview: import('@rpg/contracts').StartingPackageConversionPreview) => void
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
  onReleaseGrant,
  onRemovePurchase,
  onApplyMagicItemAcquisition,
  onCustomizePackage,
  onChangeEquipmentOption,
  onSelectedPackageItemKeysChange,
  onCancelConversion,
  onCommitConversion,
}: EquipmentInventorySummaryProps) {
  const viewModel = useMemo(
    () => buildEquipmentInventoryViewModel(draft, catalogIndex, budget, classOptionPolicy, context),
    [budget, catalogIndex, classOptionPolicy, context, draft],
  )

  if (!viewModel) {
    return <Text variant="muted">No equipment selected yet.</Text>
  }

  return (
    <div className={equipmentInventorySummaryGridClasses}>
      {viewModel.startingEquipment.kind === 'package' ? (
        <EquipmentStartingPackageSection
          packageGroup={viewModel.startingEquipment.group}
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
      ) : (
        <EquipmentInventoryColumn title={EQUIPMENT_STARTING_PACKAGE_SECTION_LABEL}>
          <div className={equipmentGoldOptionPanelClasses}>
            <Heading variant="group" as="h4">
              {viewModel.startingEquipment.message}
            </Heading>
            <Text as="p" className="text-sm text-muted-foreground">
              {viewModel.startingEquipment.description}
            </Text>
          </div>
        </EquipmentInventoryColumn>
      )}

      <EquipmentAddedInventoryColumn
        addedEquipment={viewModel.addedEquipment}
        draft={draft}
        context={context}
        catalogIndex={catalogIndex}
        budget={budget}
        reserveToolbarRow={viewModel.startingEquipment.kind === 'package'}
        onRemoveItem={onRemoveItem}
        onSetPurchaseQuantity={onSetPurchaseQuantity}
        onReleaseGrant={onReleaseGrant ?? (() => undefined)}
        onRemovePurchase={onRemovePurchase ?? (() => undefined)}
        onApplyMagicItemAcquisition={onApplyMagicItemAcquisition ?? (() => false)}
      />
    </div>
  )
}
