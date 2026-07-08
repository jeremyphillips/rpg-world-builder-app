import {
  buildChoiceSetId,
  getChoiceSetStepId,
  type CharacterBuildLanguageOption,
  type ChoiceSet,
  type Species,
  type Spell,
} from '@rpg/contracts'
import type { RadioCardOption } from '@rpg/ui'

import {
  buildSeedCreatureTypeVocabulary,
  buildSeedSenseVocabulary,
  getCreatureTypeLabel,
  getSenseLabelFromVocabulary,
} from '@/features/homebrew'
import { buildSpeciesDetailViewModel, buildSpellGrantVocabulary } from '@/features/content'

export const DEPENDENT_CHOICE_REQUIRED_STATUS = 'Required' as const

/** Generic helper when a required dependent choice has no selection yet. */
export const DEPENDENT_CHOICE_HELPER_TEXT = 'Choose one option.' as const

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
  if (required || !selectedOptionLabel) {
    return {
      statusText: DEPENDENT_CHOICE_REQUIRED_STATUS,
      helperText: DEPENDENT_CHOICE_HELPER_TEXT,
    }
  }

  return {
    statusText: `${selectedOptionLabel} selected`,
    helperText: undefined,
  }
}

function resolveLanguageLabel(
  languages: readonly CharacterBuildLanguageOption[],
  languageId: string,
): string {
  return languages.find((entry) => entry.id === languageId)?.label ?? languageId
}

function buildHeritageDisplayVocabulary(
  languages: readonly CharacterBuildLanguageOption[],
  spells: readonly Spell[],
) {
  const creatureTypeVocabulary = buildSeedCreatureTypeVocabulary()
  const senseVocabulary = buildSeedSenseVocabulary()
  const resolveSpell = buildSpellGrantVocabulary(spells)

  return {
    resolveCreatureTypeLabel: (id: string) => getCreatureTypeLabel(creatureTypeVocabulary, id),
    resolveLanguageLabel: (id: string) => resolveLanguageLabel(languages, id),
    resolveSenseLabel: (type: string) => getSenseLabelFromVocabulary(senseVocabulary, type),
    resolveSpell,
  }
}

/** Maps species heritage options to compact dependent-choice RadioCard options. */
export function mapHeritageOptionsToDependentCardOptions(
  species: Species,
  languages: readonly CharacterBuildLanguageOption[],
  spells: readonly Spell[] = [],
): RadioCardOption[] {
  if (!species.heritage) return []

  const heritageSection = buildSpeciesDetailViewModel(
    species,
    buildHeritageDisplayVocabulary(languages, spells),
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
