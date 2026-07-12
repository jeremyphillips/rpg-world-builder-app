'use client'

import { useId } from 'react'

import type {
  CharacterBuildCatalogIndex,
  CharacterBuilderDraft,
  StartingPackageConversionPreview,
} from '@rpg/contracts'
import { Heading, Text } from '@rpg/ui'

import type { StartingPackageInventoryGroup } from '../../lib/equipment-step.lib'
import {
  equipmentInventoryColumnClasses,
  equipmentInventoryColumnHeaderClasses,
} from './equipment-inventory-summary.variants'
import { EquipmentPackageConversionEditor } from './equipment-package-conversion-editor.client'
import {
  EquipmentStartingPackageCard,
  EquipmentStartingPackageInventory,
} from './equipment-starting-package-card.client'
import { EquipmentStartingPackageToolbar } from './equipment-starting-package-toolbar.client'
import { equipmentStartingPackageCustomizeReasonClasses } from './equipment-starting-package.variants'

export type EquipmentStartingPackageSectionProps = {
  packageGroup: StartingPackageInventoryGroup
  draft: CharacterBuilderDraft
  catalogIndex: CharacterBuildCatalogIndex
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
  draft,
  catalogIndex,
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
    <div className={equipmentInventoryColumnClasses}>
      <div className={equipmentInventoryColumnHeaderClasses}>
        <Heading variant="subsection" as="h3">
          {packageGroup.optionLabel}
        </Heading>

        <EquipmentStartingPackageToolbar
          customizeDisabled={customizeDisabled}
          conversionEditorOpen={conversionEditorOpen}
          customizeControlsId={editorId}
          onCustomize={onCustomize}
          onChangeEquipmentOption={onChangeEquipmentOption}
        />
      </div>

      {packageGroup.customize.status === 'disabled' ? (
        <Text as="p" className={equipmentStartingPackageCustomizeReasonClasses}>
          {packageGroup.customize.reason}
        </Text>
      ) : null}

      <EquipmentStartingPackageCard optionLabel={packageGroup.optionLabel}>
        {conversionEditorOpen ? (
          <EquipmentPackageConversionEditor
            embedded
            draft={draft}
            catalogIndex={catalogIndex}
            departingOptionId={packageGroup.optionId}
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
    </div>
  )
}
