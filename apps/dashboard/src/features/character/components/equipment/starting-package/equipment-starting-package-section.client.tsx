'use client'

import { useId } from 'react'

import type {
  CharacterBuildCatalogIndex,
  CharacterBuilderDraft,
  ResolvedStartingEquipmentFunding,
  StartingPackageConversionPreview,
} from '@rpg/contracts'
import { Text } from '@rpg/ui'

import {
  EQUIPMENT_STARTING_PACKAGE_SECTION_LABEL,
  type StartingPackageInventoryGroup,
} from '../../../lib/equipment/equipment-step.lib'
import { EquipmentInventoryColumn } from '../inventory/column/equipment-inventory-column.client'
import { EquipmentPackageConversionEditor } from '../package-switch/equipment-package-conversion-editor.client'
import {
  EquipmentStartingPackageCard,
  EquipmentStartingPackageInventory,
} from './equipment-starting-package-card.client'
import { EquipmentStartingPackageToolbar } from './equipment-starting-package-toolbar.client'
import { equipmentStartingPackageCustomizeReasonClasses } from './equipment-starting-package.variants'

export type EquipmentStartingPackageSectionProps = {
  packageGroup: StartingPackageInventoryGroup
  columnTitle?: string
  draft: CharacterBuilderDraft
  catalogIndex: CharacterBuildCatalogIndex
  goldOptionFunding?: ResolvedStartingEquipmentFunding
  conversionEditorOpen: boolean
  selectedPackageItemKeys: ReadonlySet<string>
  commitStatusMessage?: string
  onCustomize: () => void
  onChangeEquipmentOption: () => void
  onSelectedPackageItemKeysChange: (keys: ReadonlySet<string>) => void
  onCancelConversion: () => void
  onCommitConversion: (preview: StartingPackageConversionPreview) => void
}

export function EquipmentStartingPackageSection({
  packageGroup,
  columnTitle = EQUIPMENT_STARTING_PACKAGE_SECTION_LABEL,
  draft,
  catalogIndex,
  goldOptionFunding,
  conversionEditorOpen,
  selectedPackageItemKeys,
  commitStatusMessage,
  onCustomize,
  onChangeEquipmentOption,
  onSelectedPackageItemKeysChange,
  onCancelConversion,
  onCommitConversion,
}: EquipmentStartingPackageSectionProps) {
  const editorId = useId()
  const customizeDisabled = packageGroup.customize.status === 'disabled'

  return (
    <EquipmentInventoryColumn
      title={columnTitle}
      toolbar={
        <EquipmentStartingPackageToolbar
          customizeDisabled={customizeDisabled}
          conversionEditorOpen={conversionEditorOpen}
          customizeControlsId={editorId}
          onCustomize={onCustomize}
          onChangeEquipmentOption={onChangeEquipmentOption}
        />
      }
    >
      {packageGroup.customize.status === 'disabled' ? (
        <Text as="p" className={equipmentStartingPackageCustomizeReasonClasses}>
          {packageGroup.customize.reason}
        </Text>
      ) : null}

      <EquipmentStartingPackageCard
        optionLabel={packageGroup.optionLabel}
        surface={conversionEditorOpen ? 'card' : 'subtle'}
      >
        {conversionEditorOpen && goldOptionFunding ? (
          <EquipmentPackageConversionEditor
            embedded
            draft={draft}
            catalogIndex={catalogIndex}
            departingOptionId={packageGroup.optionId}
            targetFunding={goldOptionFunding}
            selectedPackageItemKeys={selectedPackageItemKeys}
            editorId={editorId}
            commitStatusMessage={commitStatusMessage}
            onSelectedPackageItemKeysChange={onSelectedPackageItemKeysChange}
            onCancel={onCancelConversion}
            onCommit={onCommitConversion}
          />
        ) : (
          <EquipmentStartingPackageInventory packageGroup={packageGroup} />
        )}
      </EquipmentStartingPackageCard>
    </EquipmentInventoryColumn>
  )
}
