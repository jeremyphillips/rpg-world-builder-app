import type { LanguageSeedOption } from '../../../vocab/language'
import type { CharacterClass } from '../../../content/classes/class'
import {
  getUnlockedGrantsAtLevel,
  resolveGrantGroupsFromContent,
} from '../../../content/lib/grants'
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

function classFeatureLanguageSource(
  classId: string,
  featureId: string,
): CharacterSelectionSource[] {
  return [{ kind: 'classFeature', sourceId: classId, grantId: featureId }]
}

function classFeatureLanguageProficiencies(
  characterClass: CharacterClass,
  characterLevel: number,
): CharacterProficiencies['languages'] {
  const entries: CharacterProficiencies['languages'] = []

  for (const feature of characterClass.features) {
    if (feature.level > characterLevel) continue

    const groups = resolveGrantGroupsFromContent(feature, { level: feature.level })
    const grants = getUnlockedGrantsAtLevel(groups, characterLevel, feature.level)

    for (const grant of grants) {
      if (grant.kind !== 'languages') continue

      for (const language of grant.languageIds) {
        entries.push({
          language,
          sources: classFeatureLanguageSource(characterClass.id, feature.id),
        })
      }
    }
  }

  return entries
}

/** Returns finalized `proficiencies.languages` rows for preview/finalization. */
export function assembleLanguageProficiencyEntries(
  draft: CharacterBuilderDraft,
  context: CharacterLanguageAssemblyContext,
  languages: readonly LanguageSeedOption[],
  choiceSets: readonly ChoiceSet[],
  characterClass?: CharacterClass,
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

  const classFeatureEntries = characterClass
    ? classFeatureLanguageProficiencies(characterClass, draft.class.level)
    : []

  return mergeLanguageProficiencyEntries([...entries, ...classFeatureEntries])
}
