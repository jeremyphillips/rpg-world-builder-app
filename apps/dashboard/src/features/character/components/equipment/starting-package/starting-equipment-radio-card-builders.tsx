import type {
  CharacterBuilderDraft,
  CharacterBuildCatalogIndex,
  CharacterClass,
  ChoiceSet,
  StartingEquipmentOptionSummary,
} from '@rpg/contracts'
import type { RadioCardOption } from '@rpg/ui'

import {
  listNestedPoolsForOption,
  listProficiencyLinksForOption,
  startingEquipmentOptionFundingSummaryLines,
} from '../../../lib/equipment/equipment-step.lib'
import {
  StartingEquipmentNestedFields,
  StartingEquipmentUnselectableReasons,
  type PendingNestedSelections,
  type StartingEquipmentOptionSelectionHandlers,
} from './starting-equipment-option-card-fields'

export function buildPackageRadioCardOption({
  summary,
  characterClass,
  catalogIndex,
  draft,
  resolvedChoiceSets,
  selectedOptionId,
  pendingNestedSelections,
  onSelectOption,
  onNestedPoolChange,
  onChoiceSelectionChange,
}: {
  summary: StartingEquipmentOptionSummary
  characterClass: CharacterClass
  catalogIndex: CharacterBuildCatalogIndex
  draft: CharacterBuilderDraft
  resolvedChoiceSets: readonly ChoiceSet[]
  selectedOptionId?: string
  pendingNestedSelections: PendingNestedSelections
  onSelectOption: StartingEquipmentOptionSelectionHandlers['onSelectOption']
  onNestedPoolChange: StartingEquipmentOptionSelectionHandlers['onNestedPoolChange']
  onChoiceSelectionChange: StartingEquipmentOptionSelectionHandlers['onChoiceSelectionChange']
}): RadioCardOption {
  const option = characterClass.characterCreation?.startingEquipment?.options.find(
    (entry) => entry.id === summary.optionId,
  )
  const nestedPools = listNestedPoolsForOption(characterClass, summary.optionId, catalogIndex)
  const proficiencyLinks = option ? listProficiencyLinksForOption(characterClass, option) : []
  const hasNestedFields = nestedPools.length > 0 || proficiencyLinks.length > 0

  return {
    value: summary.optionId,
    disabled: !summary.isSelectable,
    label: summary.label,
    description: summary.description,
    summaryLines: startingEquipmentOptionFundingSummaryLines(summary),
    embeddedContent: hasNestedFields ? (
      <StartingEquipmentNestedFields
        summary={summary}
        characterClass={characterClass}
        catalogIndex={catalogIndex}
        draft={draft}
        resolvedChoiceSets={resolvedChoiceSets}
        selectedOptionId={selectedOptionId}
        pendingNestedSelections={pendingNestedSelections}
        onSelectOption={onSelectOption}
        onNestedPoolChange={onNestedPoolChange}
        onChoiceSelectionChange={onChoiceSelectionChange}
      />
    ) : undefined,
    footerContent:
      summary.unselectableReasons.length > 0 ? (
        <StartingEquipmentUnselectableReasons reasons={summary.unselectableReasons} />
      ) : undefined,
  }
}

export function buildGoldRadioCardOption(summary: StartingEquipmentOptionSummary): RadioCardOption {
  return {
    value: summary.optionId,
    disabled: !summary.isSelectable,
    label: summary.label,
    description: summary.description,
    summaryLines: startingEquipmentOptionFundingSummaryLines(summary),
    footerContent:
      summary.unselectableReasons.length > 0 ? (
        <StartingEquipmentUnselectableReasons reasons={summary.unselectableReasons} />
      ) : undefined,
  }
}
