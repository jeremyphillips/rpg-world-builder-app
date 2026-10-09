import { useCallback, useMemo, useState } from 'react'

import {
  isStartingGoldOption,
  type CharacterBuilderDraft,
  type CharacterBuildCatalogIndex,
  type CharacterClass,
  type ChoiceSet,
  type StartingEquipmentOptionSummary,
} from '@rpg/contracts'
import { RadioCard, type SelectionOptionCardDensity } from '@rpg/ui'

import { filterPackageStartingEquipmentSummaries } from '../../../lib/equipment/equipment-step.lib'
import {
  type PendingNestedSelections,
  type StartingEquipmentOptionSelectionHandlers,
} from './starting-equipment-option-card-fields'
import {
  buildGoldRadioCardOption,
  buildPackageRadioCardOption,
} from './starting-equipment-radio-card-builders'

export type StartingEquipmentOptionCardsProps = {
  characterClass: CharacterClass
  catalogIndex: CharacterBuildCatalogIndex
  summaries: readonly StartingEquipmentOptionSummary[]
  draft: CharacterBuilderDraft
  resolvedChoiceSets: readonly ChoiceSet[]
  selectedOptionId?: string
  isPackageChooserExpanded: boolean
  onCollapseChooser: () => void
  /** When false, wealth-only starting gold options are omitted from the radio list. Default true. */
  includeGoldOption?: boolean
  density?: SelectionOptionCardDensity
} & StartingEquipmentOptionSelectionHandlers

export function StartingEquipmentOptionCards({
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
  onCollapseChooser,
  includeGoldOption = true,
  density = 'default',
}: StartingEquipmentOptionCardsProps) {
  const [pendingNestedSelections, setPendingNestedSelections] = useState<PendingNestedSelections>(
    {},
  )

  const options = characterClass.characterCreation?.startingEquipment?.options ?? []
  const goldOption = includeGoldOption ? options.find(isStartingGoldOption) : undefined
  const packageSummaries = filterPackageStartingEquipmentSummaries(characterClass, summaries)
  const goldSummary = goldOption
    ? summaries.find((summary) => summary.optionId === goldOption.id)
    : undefined

  const handleNestedPoolChange = useCallback<
    StartingEquipmentOptionCardsProps['onNestedPoolChange']
  >(
    (optionId, choiceSetId, selection, nestedSelections) => {
      setPendingNestedSelections((current) => ({
        ...current,
        [optionId]: {
          ...(current[optionId] ?? {}),
          [choiceSetId]: selection,
        },
      }))
      onNestedPoolChange(optionId, choiceSetId, selection, nestedSelections)
    },
    [onNestedPoolChange],
  )

  const radioCardOptions = useMemo(() => {
    const packageOptions = packageSummaries.map((summary) =>
      buildPackageRadioCardOption({
        summary,
        characterClass,
        catalogIndex,
        draft,
        resolvedChoiceSets,
        selectedOptionId,
        pendingNestedSelections,
        onSelectOption,
        onNestedPoolChange: handleNestedPoolChange,
        onChoiceSelectionChange,
      }),
    )

    return goldSummary ? [...packageOptions, buildGoldRadioCardOption(goldSummary)] : packageOptions
  }, [
    catalogIndex,
    characterClass,
    draft,
    goldSummary,
    handleNestedPoolChange,
    onChoiceSelectionChange,
    onSelectOption,
    packageSummaries,
    pendingNestedSelections,
    resolvedChoiceSets,
    selectedOptionId,
  ])

  return (
    <RadioCard
      aria-label="Starting equipment options"
      density={density}
      value={selectedOptionId ?? ''}
      onValueChange={(optionId) => {
        if (!optionId) return

        if (optionId === selectedOptionId && isPackageChooserExpanded) {
          onCollapseChooser()
          return
        }

        const pending = pendingNestedSelections[optionId] ?? {}
        const nestedSelections = {
          ...draft.choiceSelections,
          ...pending,
        }

        onSelectOption(optionId, nestedSelections)
      }}
      options={radioCardOptions}
    />
  )
}
