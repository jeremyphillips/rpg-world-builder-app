import { useMemo } from 'react'

import type {
  CharacterBuilderDraft,
  CharacterBuildCatalogIndex,
  CharacterClass,
  ChoiceSet,
  StartingEquipmentOptionSummary,
} from '@rpg/contracts'

import { getContentTypeMidSentenceLabel } from '@/features/content'
import type { SelectionOptionCardDensity } from '@rpg/ui'

import {
  countStartingEquipmentRadioOptions,
  filterPackageStartingEquipmentSummaries,
  isSelectedStartingEquipmentReady,
} from '../../../lib/equipment/equipment-step.lib'
import { StartingEquipmentOptionCards } from './starting-equipment-option-cards'
import { StartingEquipmentOptionSummaryCard } from './starting-equipment-option-summary'

export type StartingEquipmentOptionSectionProps = {
  characterClass: CharacterClass
  catalogIndex: CharacterBuildCatalogIndex
  summaries: readonly StartingEquipmentOptionSummary[]
  draft: CharacterBuilderDraft
  resolvedChoiceSets: readonly ChoiceSet[]
  selectedOptionId?: string
  isPackageChooserExpanded: boolean
  onSelectOption: (
    optionId: string,
    nestedSelections: CharacterBuilderDraft['choiceSelections'],
  ) => void
  onNestedPoolChange: (
    optionId: string,
    choiceSetId: string,
    selection: string[],
    nestedSelections: CharacterBuilderDraft['choiceSelections'],
  ) => void
  onChoiceSelectionChange: (choiceSetId: string, selection: readonly string[]) => void
  onChangePackage: () => void
  onCollapseChooser: () => void
  includeGoldOption?: boolean
  density?: SelectionOptionCardDensity
}

export function StartingEquipmentOptionSection({
  characterClass,
  catalogIndex,
  summaries,
  draft,
  resolvedChoiceSets,
  selectedOptionId,
  isPackageChooserExpanded,
  onSelectOption,
  onNestedPoolChange,
  onChoiceSelectionChange,
  onChangePackage,
  onCollapseChooser,
  includeGoldOption = true,
  density = 'default',
}: StartingEquipmentOptionSectionProps) {
  const cardSummaries = useMemo(
    () =>
      includeGoldOption
        ? summaries
        : filterPackageStartingEquipmentSummaries(characterClass, summaries),
    [characterClass, includeGoldOption, summaries],
  )

  const showChangePackage = useMemo(
    () =>
      countStartingEquipmentRadioOptions({
        characterClass,
        summaries,
        includeGoldOption,
      }) > 1,
    [characterClass, includeGoldOption, summaries],
  )

  const selectedSummary = useMemo(
    () => cardSummaries.find((summary) => summary.optionId === selectedOptionId),
    [cardSummaries, selectedOptionId],
  )

  const showSummary = useMemo(() => {
    if (!selectedOptionId || !selectedSummary || isPackageChooserExpanded) return false

    return isSelectedStartingEquipmentReady({
      characterClass,
      catalogIndex,
      draft,
      selectedOptionId,
    })
  }, [
    catalogIndex,
    characterClass,
    draft,
    selectedOptionId,
    selectedSummary,
    isPackageChooserExpanded,
  ])

  return (
    <section
      id="starting-equipment-options"
      tabIndex={-1}
      className="outline-none"
      aria-label={`Starting ${getContentTypeMidSentenceLabel('equipment')} options`}
    >
      {showSummary && selectedSummary ? (
        <StartingEquipmentOptionSummaryCard
          summary={selectedSummary}
          density={density}
          onChangePackage={onChangePackage}
          showChangePackage={showChangePackage}
        />
      ) : (
        <StartingEquipmentOptionCards
          characterClass={characterClass}
          catalogIndex={catalogIndex}
          summaries={cardSummaries}
          draft={draft}
          resolvedChoiceSets={resolvedChoiceSets}
          selectedOptionId={selectedOptionId}
          isPackageChooserExpanded={isPackageChooserExpanded}
          onSelectOption={onSelectOption}
          onNestedPoolChange={onNestedPoolChange}
          onChoiceSelectionChange={onChoiceSelectionChange}
          onCollapseChooser={onCollapseChooser}
          includeGoldOption={includeGoldOption}
          density={density}
        />
      )}
    </section>
  )
}
