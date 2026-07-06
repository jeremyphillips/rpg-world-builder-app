import { resolveTraitName } from '../../../content/lib/trait-display'
import type { Species } from '../../../content/species'
import { buildChoiceSetId, type ChoiceSet } from '../choice-set'
import type { CharacterBuildCatalogIndex } from '../context'
import type { CharacterBuilderDraft } from '../draft'

export function resolveSelectedHeritageOptionId(
  draft: CharacterBuilderDraft,
  species: Species,
): string | undefined {
  if (draft.species.heritageId) return draft.species.heritageId

  const heritageChoiceId = buildChoiceSetId('species', species.id, 'heritage')
  return draft.choiceSelections[heritageChoiceId]?.[0]
}

/** Builds species heritage trait ChoiceSets when the species defines heritage options. */
export function resolveSpeciesHeritageChoiceSets(
  draft: CharacterBuilderDraft,
  catalogIndex: CharacterBuildCatalogIndex,
): ChoiceSet[] {
  const speciesId = draft.species.speciesId
  if (!speciesId) return []

  const species = catalogIndex.species.get(speciesId)
  if (!species?.heritage) return []

  return [
    {
      id: buildChoiceSetId('species', species.id, 'heritage'),
      sourceType: 'species',
      sourceId: species.id,
      choiceType: 'trait',
      label: species.heritage.name,
      min: species.heritage.choose,
      max: species.heritage.choose,
      options: species.heritage.options.map((option) => ({
        id: option.id,
        label: resolveTraitName(option),
      })),
      required: true,
    },
  ]
}
