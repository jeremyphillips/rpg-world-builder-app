import type { CharacterBuildCatalogIndex } from '../../context'
import type { CharacterBuilderDraft } from '../../draft/draft'

export type DeriveRecommendedLanguageIdsArgs = {
  draft: CharacterBuilderDraft
  catalogIndex: CharacterBuildCatalogIndex
  choiceSetOptionIds: readonly string[]
}

/**
 * Recommended language ids for origin (and future language) ChoiceSets.
 * Intersects species `languageAffinities` with the ChoiceSet option pool only —
 * never grants languages or expands selectable options.
 */
export function deriveRecommendedLanguageIds({
  draft,
  catalogIndex,
  choiceSetOptionIds,
}: DeriveRecommendedLanguageIdsArgs): ReadonlySet<string> {
  const speciesId = draft.species.speciesId
  if (!speciesId || choiceSetOptionIds.length === 0) {
    return new Set()
  }

  const species = catalogIndex.species.get(speciesId)
  const affinities = species?.languageAffinities
  if (!affinities?.length) {
    return new Set()
  }

  const optionIds = new Set(choiceSetOptionIds)
  const recommended = new Set<string>()

  for (const languageId of affinities) {
    if (optionIds.has(languageId)) {
      recommended.add(languageId)
    }
  }

  return recommended
}
