'use client'

import { useId } from 'react'

import type {
  CharacterBuildCatalogIndex,
  CharacterBuilderDraft,
  StartingPackageConversionPreview,
} from '@rpg/contracts'

import type { StartingPackageInventoryGroup } from '../../lib/equipment-step.lib'
import { EquipmentPackageConversionEditor } from './equipment-package-conversion-editor.client'
import { EquipmentStartingPackageCard } from './equipment-starting-package-card.client'

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

  return (
    <div className="space-y-0">
      <EquipmentStartingPackageCard
        packageGroup={packageGroup}
        conversionEditorOpen={conversionEditorOpen}
        customizeControlsId={editorId}
        onCustomize={onCustomize}
        onChangeEquipmentOption={onChangeEquipmentOption}
      />
      {conversionEditorOpen ? (
        <EquipmentPackageConversionEditor
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
      ) : null}
    </div>
  )
}
