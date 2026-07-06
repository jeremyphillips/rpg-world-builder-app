import type { LanguageProficiencyGrantSet } from '../../../content/lib/proficiency-grant-set'
import { isMeaningfulLanguageProficiencyChoice } from '../../../content/lib/proficiency-grant-set'
import type { LanguageId } from '../../../vocab/language'
import { getLanguageLabel } from '../../../vocab/language'
import type {
  CharacterLanguageProficiencyEntry,
  CharacterProficiencies,
} from '../../character/proficiencies'
import type { CharacterSelectionSource } from '../../character/selection-sources'
import { buildChoiceSetId, isChoiceSetSatisfied, type ChoiceSet } from '../choice-set'
import type { CharacterBuildCatalogIndex, CharacterBuildContext } from '../context'
import type { CharacterBuilderDraft } from '../draft'

// ---------------------------------------------------------------------------
// Language resolution — derives grants, choice pools, and finalized sheet rows
// from character-creation rules and vocabulary catalog data.
// ---------------------------------------------------------------------------

export const LANGUAGE_GRANTS_SOURCE_ID = 'language-grants' as const

export type ResolvedLanguageGrant = {
  language: LanguageId
  sources: CharacterSelectionSource[]
}

export type ResolvedLanguageSelection = {
  language: LanguageId
  choiceSetId: string
  sources: CharacterSelectionSource[]
}

export type DerivedCharacterLanguages = {
  granted: ResolvedLanguageGrant[]
  selected: ResolvedLanguageSelection[]
  items: LanguageId[]
  unresolvedChoiceSetIds: string[]
}

export type CharacterLanguageAssemblyContext = Pick<
  CharacterBuildContext,
  'rulesetId' | 'characterCreationRules'
>

function uniqueLanguageIds(ids: readonly string[]): LanguageId[] {
  return [...new Set(ids)]
}

function activeLanguageOptions(catalogIndex: CharacterBuildCatalogIndex) {
  return catalogIndex.languages
}

function expandLanguageGrantSet(
  grantSet: LanguageProficiencyGrantSet,
  catalogIndex: CharacterBuildCatalogIndex,
): LanguageId[] {
  const languages = activeLanguageOptions(catalogIndex)
  const fromCategories = grantSet.categories.flatMap((category) =>
    languages.filter((language) => language.category === category).map((language) => language.id),
  )

  return uniqueLanguageIds([...grantSet.items, ...fromCategories])
}

function characterCreationLanguageGrantSources(rulesetId: string): CharacterSelectionSource[] {
  return [{ kind: 'characterCreation', sourceId: rulesetId, grantId: LANGUAGE_GRANTS_SOURCE_ID }]
}

function characterCreationLanguageChoiceSources(choiceSet: ChoiceSet): CharacterSelectionSource[] {
  return [{ kind: 'characterCreation', sourceId: choiceSet.sourceId, grantId: choiceSet.id }]
}

/** Returns automatic language grants from character-creation rules. */
export function resolveGrantedLanguages(
  context: CharacterLanguageAssemblyContext,
  catalogIndex: CharacterBuildCatalogIndex,
): ResolvedLanguageGrant[] {
  const grantSet = context.characterCreationRules.proficiencyGrants.languages
  const sources = characterCreationLanguageGrantSources(context.rulesetId)

  return expandLanguageGrantSet(grantSet, catalogIndex).map((language) => ({
    language,
    sources,
  }))
}

/** Resolves selectable options for a language proficiency choice. */
export function resolveLanguageChoiceOptions(
  choice: Parameters<typeof isMeaningfulLanguageProficiencyChoice>[0],
  catalogIndex: CharacterBuildCatalogIndex,
): ChoiceSet['options'] {
  const languages = activeLanguageOptions(catalogIndex)

  if (choice.from.length > 0) {
    return choice.from.map((id) => ({
      id,
      label: languages.find((language) => language.id === id)?.label ?? getLanguageLabel(id),
    }))
  }

  if (choice.categories.length > 0) {
    return languages
      .filter((language) => choice.categories.includes(language.category))
      .map((language) => ({ id: language.id, label: language.label }))
  }

  return []
}

/** Builds language ChoiceSets from character-creation proficiency choices. */
export function resolveLanguageChoiceSets(
  context: CharacterLanguageAssemblyContext,
  catalogIndex: CharacterBuildCatalogIndex,
): ChoiceSet[] {
  // v1: only the first meaningful language choice package is supported.
  const choice = context.characterCreationRules.proficiencyChoices.languages.find(
    isMeaningfulLanguageProficiencyChoice,
  )
  if (!choice) return []

  const options = resolveLanguageChoiceOptions(choice, catalogIndex)
  if (options.length === 0) return []

  return [
    {
      id: buildChoiceSetId('ruleset', context.rulesetId, choice.id),
      sourceType: 'ruleset',
      sourceId: context.rulesetId,
      choiceType: 'language',
      label: choice.label ?? 'Choose Languages',
      min: choice.choose,
      max: choice.choose,
      options,
      required: true,
    },
  ]
}

function languageChoiceSetsFromList(choiceSets: readonly ChoiceSet[]): ChoiceSet[] {
  return choiceSets.filter((choiceSet) => choiceSet.choiceType === 'language')
}

function unresolvedLanguageChoiceSetIds(
  draft: CharacterBuilderDraft,
  choiceSets: readonly ChoiceSet[],
): string[] {
  return languageChoiceSetsFromList(choiceSets)
    .filter(
      (choiceSet) =>
        choiceSet.required &&
        !isChoiceSetSatisfied(choiceSet, draft.choiceSelections[choiceSet.id] ?? []),
    )
    .map((choiceSet) => choiceSet.id)
}

function selectedLanguageEntries(
  draft: CharacterBuilderDraft,
  choiceSets: readonly ChoiceSet[],
): ResolvedLanguageSelection[] {
  const entries: ResolvedLanguageSelection[] = []

  for (const choiceSet of languageChoiceSetsFromList(choiceSets)) {
    const selections = draft.choiceSelections[choiceSet.id] ?? []
    for (const language of selections) {
      entries.push({
        language,
        choiceSetId: choiceSet.id,
        sources: characterCreationLanguageChoiceSources(choiceSet),
      })
    }
  }

  return entries
}

function mergeLanguageProficiencyEntries(
  entries: CharacterLanguageProficiencyEntry[],
): CharacterLanguageProficiencyEntry[] {
  const byLanguage = new Map<string, CharacterLanguageProficiencyEntry>()

  for (const entry of entries) {
    const existing = byLanguage.get(entry.language)
    if (!existing) {
      byLanguage.set(entry.language, entry)
      continue
    }

    byLanguage.set(entry.language, {
      language: entry.language,
      sources: [...(existing.sources ?? []), ...(entry.sources ?? [])],
      notes: existing.notes ?? entry.notes,
    })
  }

  return [...byLanguage.values()]
}

/** Combines automatic grants and draft selections into a derived language model. */
export function deriveCharacterLanguages(
  draft: CharacterBuilderDraft,
  context: CharacterLanguageAssemblyContext,
  catalogIndex: CharacterBuildCatalogIndex,
  choiceSets: readonly ChoiceSet[] = resolveLanguageChoiceSets(context, catalogIndex),
): DerivedCharacterLanguages {
  const granted = resolveGrantedLanguages(context, catalogIndex)
  const selected = selectedLanguageEntries(draft, choiceSets)
  const items = uniqueLanguageIds([
    ...granted.map((entry) => entry.language),
    ...selected.map((entry) => entry.language),
  ])

  return {
    granted,
    selected,
    items,
    unresolvedChoiceSetIds: unresolvedLanguageChoiceSetIds(draft, choiceSets),
  }
}

/** Returns finalized `proficiencies.languages` rows for preview/finalization. */
export function assembleLanguageProficiencies(
  draft: CharacterBuilderDraft,
  context: CharacterLanguageAssemblyContext,
  catalogIndex: CharacterBuildCatalogIndex,
  choiceSets: readonly ChoiceSet[] = resolveLanguageChoiceSets(context, catalogIndex),
): CharacterProficiencies['languages'] {
  const derived = deriveCharacterLanguages(draft, context, catalogIndex, choiceSets)

  return mergeLanguageProficiencyEntries([
    ...derived.granted.map((entry) => ({
      language: entry.language,
      sources: entry.sources,
    })),
    ...derived.selected.map((entry) => ({
      language: entry.language,
      sources: entry.sources,
    })),
  ])
}
