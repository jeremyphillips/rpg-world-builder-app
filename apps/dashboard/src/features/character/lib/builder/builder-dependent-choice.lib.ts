import {
  buildChoiceSetId,
  characterBuilderDependentChoiceMessages,
  formatFieldMessage,
  getChoiceSetStepId,
  type CharacterBuildLanguageOption,
  type ChoiceSet,
  type Species,
  type SpellCatalogContext,
} from '@rpg/contracts'
import type { RadioCardOption } from '@rpg/ui'

import { buildSpeciesDetailViewModel, type SpeciesDisplayVocabulary } from '@/features/content'

import { buildBuilderSpeciesVocabulary } from './builder-species-option-display.lib'

export type DependentChoiceSectionCopy = {
  statusText: string
  helperText?: string
}

export type ResolveDependentChoiceSectionCopyInput = {
  required: boolean
  selectedOptionLabel?: string
}

/** Section status + helper copy for a dependent-choice region. */
export function resolveDependentChoiceSectionCopy({
  required,
  selectedOptionLabel,
}: ResolveDependentChoiceSectionCopyInput): DependentChoiceSectionCopy {
  if (selectedOptionLabel) {
    return {
      statusText: formatFieldMessage(
        characterBuilderDependentChoiceMessages.optionSelected({ selectedOptionLabel }),
      ),
      helperText: undefined,
    }
  }

  if (required) {
    return {
      statusText: formatFieldMessage(characterBuilderDependentChoiceMessages.requiredStatus()),
      helperText: formatFieldMessage(characterBuilderDependentChoiceMessages.helperText()),
    }
  }

  return {
    statusText: '',
    helperText: formatFieldMessage(characterBuilderDependentChoiceMessages.helperText()),
  }
}

/** Maps species heritage options to compact dependent-choice RadioCard options. */
export function mapHeritageOptionsToDependentCardOptions(
  species: Species,
  languages: readonly CharacterBuildLanguageOption[],
  spellCatalog: SpellCatalogContext,
  resolveDamageTypeLabel?: SpeciesDisplayVocabulary['resolveDamageTypeLabel'],
): RadioCardOption[] {
  if (!species.heritage) return []

  const heritageSection = buildSpeciesDetailViewModel(
    species,
    buildBuilderSpeciesVocabulary(languages, spellCatalog, resolveDamageTypeLabel),
  ).sections.find((section) => section.id === 'heritage')

  if (!heritageSection) return []

  return heritageSection.items.map((item) => ({
    value: item.id,
    label: item.title,
    summaryLines: item.summaryLines,
  }))
}

/** Finds the heritage ChoiceSet for the selected species, when present. */
export function findSpeciesHeritageChoiceSet(
  choiceSets: readonly ChoiceSet[],
  speciesId: string,
): ChoiceSet | undefined {
  const heritageChoiceSetId = buildChoiceSetId('species', speciesId, 'heritage')

  return choiceSets.find(
    (choiceSet) =>
      getChoiceSetStepId(choiceSet) === 'species' && choiceSet.id === heritageChoiceSetId,
  )
}
