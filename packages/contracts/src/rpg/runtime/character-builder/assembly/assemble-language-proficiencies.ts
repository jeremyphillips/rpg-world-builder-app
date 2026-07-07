import type { LanguageSeedOption } from '../../../vocab/language'
import { resolveLanguageIdsFromGrantSet } from '../../creature/languages'
import {
  assembleLanguageProficiencyIds,
  LANGUAGE_GRANTS_SOURCE_ID,
  mergeLanguageProficiencyEntries,
} from '../../character/languages'
import type { CharacterProficiencies } from '../../character/proficiencies'
import type { CharacterSelectionSource } from '../../character/selection-sources'
import type { ChoiceSet } from '../choice-set'
import type { CharacterBuildContext } from '../context'
import type { CharacterBuilderDraft } from '../draft'

// ---------------------------------------------------------------------------
// Character Builder language finalization — orchestrates creature primitives,
// draft selections, and character assembly into proficiency rows with sources.
// ---------------------------------------------------------------------------

export type CharacterLanguageAssemblyContext = Pick<
  CharacterBuildContext,
  'rulesetId' | 'characterCreationRules'
>

function characterCreationLanguageGrantSources(rulesetId: string): CharacterSelectionSource[] {
  return [{ kind: 'characterCreation', sourceId: rulesetId, grantId: LANGUAGE_GRANTS_SOURCE_ID }]
}

function characterCreationLanguageChoiceSources(choiceSet: ChoiceSet): CharacterSelectionSource[] {
  return [{ kind: 'characterCreation', sourceId: choiceSet.sourceId, grantId: choiceSet.id }]
}

function languageChoiceSetsFromList(choiceSets: readonly ChoiceSet[]): ChoiceSet[] {
  return choiceSets.filter((choiceSet) => choiceSet.choiceType === 'language')
}

function grantedLanguageIds(
  context: CharacterLanguageAssemblyContext,
  languages: readonly LanguageSeedOption[],
): string[] {
  return resolveLanguageIdsFromGrantSet({
    grantSet: context.characterCreationRules.proficiencyGrants.languages,
    languages,
  })
}

function selectedLanguageIds(
  draft: CharacterBuilderDraft,
  choiceSets: readonly ChoiceSet[],
): string[] {
  const ids: string[] = []

  for (const choiceSet of languageChoiceSetsFromList(choiceSets)) {
    ids.push(...(draft.choiceSelections[choiceSet.id] ?? []))
  }

  return ids
}

/** Returns finalized `proficiencies.languages` rows for preview/finalization. */
export function assembleLanguageProficiencyEntries(
  draft: CharacterBuilderDraft,
  context: CharacterLanguageAssemblyContext,
  languages: readonly LanguageSeedOption[],
  choiceSets: readonly ChoiceSet[],
): CharacterProficiencies['languages'] {
  const grantSources = characterCreationLanguageGrantSources(context.rulesetId)
  const grantedIds = grantedLanguageIds(context, languages)
  const selectedIds = selectedLanguageIds(draft, choiceSets)
  const assembled = assembleLanguageProficiencyIds({ grantedIds, selectedIds })

  const entries = assembled.items.flatMap((language) => {
    const rows: CharacterProficiencies['languages'] = []

    if (grantedIds.includes(language)) {
      rows.push({ language, sources: grantSources })
    }

    for (const choiceSet of languageChoiceSetsFromList(choiceSets)) {
      const selections = draft.choiceSelections[choiceSet.id] ?? []
      if (selections.includes(language)) {
        rows.push({
          language,
          sources: characterCreationLanguageChoiceSources(choiceSet),
        })
      }
    }

    return rows
  })

  return mergeLanguageProficiencyEntries(entries)
}
