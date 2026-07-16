'use client'

import { useMemo } from 'react'

import type {
  CharacterBuilderDraft,
  CharacterBuildCatalogIndex,
  CharacterClass,
  ChoiceSet,
  StartingEquipmentOptionSummary,
} from '@rpg/contracts'

import { isSelectedStartingEquipmentReady } from '../../lib/equipment-step.lib'
import { StartingEquipmentOptionCards } from './starting-equipment-option-cards.client'
import { StartingEquipmentOptionSummaryCard } from './starting-equipment-option-summary.client'

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
}: StartingEquipmentOptionSectionProps) {
  const selectedSummary = useMemo(
    () => summaries.find((summary) => summary.optionId === selectedOptionId),
    [selectedOptionId, summaries],
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
      aria-label="Starting equipment options"
    >
      {showSummary && selectedSummary ? (
        <StartingEquipmentOptionSummaryCard
          summary={selectedSummary}
          onChangePackage={onChangePackage}
        />
      ) : (
        <StartingEquipmentOptionCards
          characterClass={characterClass}
          catalogIndex={catalogIndex}
          summaries={summaries}
          draft={draft}
          resolvedChoiceSets={resolvedChoiceSets}
          selectedOptionId={selectedOptionId}
          isPackageChooserExpanded={isPackageChooserExpanded}
          onSelectOption={onSelectOption}
          onNestedPoolChange={onNestedPoolChange}
          onChoiceSelectionChange={onChoiceSelectionChange}
          onCollapseChooser={onCollapseChooser}
        />
      )}
    </section>
  )
}
