import { useMemo, useState } from 'react'

import type {
  CharacterBuildCatalogIndex,
  CharacterBuildContext,
  CharacterBuilderDraft,
  ChoiceSet,
  ClassOptionPolicy,
  EquipmentBudgetSummary,
  ResolvedStartingEquipmentFunding,
  StartingPackageConversionPreview,
} from '@rpg/contracts'
import { Badge, Heading, Text } from '@rpg/ui'

import {
  EQUIPMENT_ADDED_INVENTORY_SECTION_LABEL,
  EQUIPMENT_INVENTORY_EMPTY_MESSAGE,
  type EquipmentInventoryQuantityTarget,
  type EquipmentInventoryRemoveTarget,
} from '../../../../lib/equipment/equipment-step.lib'
import { EquipmentAddedInventorySection } from '../added/equipment-added-inventory-section'
import {
  EquipmentStartingPackageDisclosure,
  EquipmentStartingPackageGoldHeader,
} from '../../starting-package/equipment-starting-package-disclosure'
import {
  buildEquipmentInventoryViewModel,
  type AddedEquipmentCategoryGroup,
  type EquipmentInventoryStartingChannel,
} from '../../../../lib/equipment/equipment-inventory-summary.lib'
import {
  EQUIPMENT_INVENTORY_SECTION_TITLE_VARIANT,
  equipmentInventoryPanelClasses,
  equipmentInventoryPanelDividerClasses,
  equipmentInventorySectionClasses,
  equipmentInventorySectionHeaderClasses,
} from '../equipment-inventory.variants'

export type EquipmentInventorySummaryProps = {
  draft: CharacterBuilderDraft
  catalogIndex: CharacterBuildCatalogIndex
  context: CharacterBuildContext
  budget?: EquipmentBudgetSummary
  goldOptionFunding?: ResolvedStartingEquipmentFunding
  classOptionPolicy?: ClassOptionPolicy
  resolvedChoiceSets?: readonly ChoiceSet[]
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
  onCommitConversion?: (preview: StartingPackageConversionPreview) => void
  emptyMessage?: string
}

function EquipmentInventoryStartingSection({
  startingEquipment,
  draft,
  catalogIndex,
  goldOptionFunding,
  conversionEditorOpen,
  selectedPackageItemKeys,
  conversionCommitStatusMessage,
  onCustomizePackage,
  onChangeEquipmentOption,
  onSelectedPackageItemKeysChange,
  onCancelConversion,
  onCommitConversion,
}: {
  startingEquipment: EquipmentInventoryStartingChannel
  draft: CharacterBuilderDraft
  catalogIndex: CharacterBuildCatalogIndex
  goldOptionFunding?: ResolvedStartingEquipmentFunding
  conversionEditorOpen: boolean
  selectedPackageItemKeys: ReadonlySet<string>
  conversionCommitStatusMessage?: string
  onCustomizePackage?: () => void
  onChangeEquipmentOption?: () => void
  onSelectedPackageItemKeysChange?: (keys: ReadonlySet<string>) => void
  onCancelConversion?: () => void
  onCommitConversion?: (preview: StartingPackageConversionPreview) => void
}) {
  if (startingEquipment.kind === 'package') {
    return (
      <EquipmentStartingPackageDisclosure
        packageGroup={startingEquipment.group}
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
    )
  }

  return <EquipmentStartingPackageGoldHeader optionLabel={startingEquipment.optionLabel} />
}

function EquipmentAddedInventoryBlock({
  addedEquipment,
  draft,
  context,
  catalogIndex,
  budget,
  onRemoveItem,
  onSetPurchaseQuantity,
  onReleaseGrant,
  onRemovePurchase,
  onApplyMagicItemAcquisition,
}: {
  addedEquipment: AddedEquipmentCategoryGroup[]
  draft: CharacterBuilderDraft
  context: CharacterBuildContext
  catalogIndex: CharacterBuildCatalogIndex
  budget?: EquipmentBudgetSummary
  onRemoveItem?: (target: EquipmentInventoryRemoveTarget) => void
  onSetPurchaseQuantity?: (target: EquipmentInventoryQuantityTarget, quantity: number) => void
  onReleaseGrant: (args: { allowanceId: string; equipmentId: string; quantity: number }) => void
  onRemovePurchase: (args: { purchaseId: string; quantity: number }) => void
  onApplyMagicItemAcquisition: (args: { equipmentId: string; requestedQuantity: number }) => boolean
}) {
  const [openEquipmentId, setOpenEquipmentId] = useState<string | null>(null)
  const addedInventoryCount = useMemo(
    () =>
      addedEquipment
        .flatMap((group) => group.entries)
        .reduce((sum, entry) => sum + entry.totalQuantity, 0),
    [addedEquipment],
  )

  return (
    <section className={equipmentInventorySectionClasses}>
      <div className={equipmentInventorySectionHeaderClasses}>
        <Heading variant={EQUIPMENT_INVENTORY_SECTION_TITLE_VARIANT} as="h3">
          {EQUIPMENT_ADDED_INVENTORY_SECTION_LABEL}
        </Heading>
        {addedInventoryCount > 0 ? (
          <Badge appearance="soft" tone="neutral" size="sm">
            {addedInventoryCount}
          </Badge>
        ) : null}
      </div>
      <EquipmentAddedInventorySection
        addedEquipment={addedEquipment}
        draft={draft}
        context={context}
        catalogIndex={catalogIndex}
        budget={budget}
        onRemoveItem={onRemoveItem}
        onSetPurchaseQuantity={onSetPurchaseQuantity}
        onReleaseGrant={onReleaseGrant}
        onRemovePurchase={onRemovePurchase}
        onApplyMagicItemAcquisition={onApplyMagicItemAcquisition}
        openEquipmentId={openEquipmentId}
        onOpenEquipmentChange={setOpenEquipmentId}
      />
    </section>
  )
}

export function EquipmentInventorySummary({
  draft,
  catalogIndex,
  context,
  budget,
  goldOptionFunding,
  classOptionPolicy = 'included',
  resolvedChoiceSets = [],
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
  emptyMessage = EQUIPMENT_INVENTORY_EMPTY_MESSAGE,
}: EquipmentInventorySummaryProps) {
  const viewModel = useMemo(
    () =>
      buildEquipmentInventoryViewModel(
        draft,
        catalogIndex,
        budget,
        classOptionPolicy,
        context,
        resolvedChoiceSets,
      ),
    [budget, catalogIndex, classOptionPolicy, context, draft, resolvedChoiceSets],
  )

  if (!viewModel) {
    return <Text variant="muted">{emptyMessage}</Text>
  }

  return (
    <div className={equipmentInventoryPanelClasses}>
      <EquipmentAddedInventoryBlock
        addedEquipment={viewModel.addedEquipment}
        draft={draft}
        context={context}
        catalogIndex={catalogIndex}
        budget={budget}
        onRemoveItem={onRemoveItem}
        onSetPurchaseQuantity={onSetPurchaseQuantity}
        onReleaseGrant={onReleaseGrant ?? (() => undefined)}
        onRemovePurchase={onRemovePurchase ?? (() => undefined)}
        onApplyMagicItemAcquisition={onApplyMagicItemAcquisition ?? (() => false)}
      />
      {viewModel.layout === 'split' ? (
        <>
          <div className={equipmentInventoryPanelDividerClasses} role="separator" />
          <EquipmentInventoryStartingSection
            startingEquipment={viewModel.startingEquipment}
            draft={draft}
            catalogIndex={catalogIndex}
            goldOptionFunding={goldOptionFunding}
            conversionEditorOpen={conversionEditorOpen}
            selectedPackageItemKeys={selectedPackageItemKeys}
            conversionCommitStatusMessage={conversionCommitStatusMessage}
            onCustomizePackage={onCustomizePackage}
            onChangeEquipmentOption={onChangeEquipmentOption}
            onSelectedPackageItemKeysChange={onSelectedPackageItemKeysChange}
            onCancelConversion={onCancelConversion}
            onCommitConversion={onCommitConversion}
          />
        </>
      ) : null}
    </div>
  )
}
