import type { ContentTrait } from '../../../../content/lib/grants'
import type { ChoiceSet } from '../../choice-set'
import type { CharacterBuildCatalogIndex } from '../../context'
import type { CharacterBuilderDraft } from '../../draft/draft'
import { resolveSelectedHeritageOptionId } from './resolve-species-heritage-choice-sets'
import { unlockedGrantChoiceSets } from '../grants/unlocked-grant-choice-sets'

function traitGrantChoiceSets(
  trait: ContentTrait,
  speciesId: string,
  catalogIndex: CharacterBuildCatalogIndex,
  traitKey: string,
): ChoiceSet[] {
  return unlockedGrantChoiceSets(
    trait,
    catalogIndex,
    {
      sourceType: 'species',
      sourceId: speciesId,
      slot: `trait:${traitKey}`,
    },
    {
      parentLevel: 1,
      grantSlot: (grant) => `trait:${traitKey}:${grant.kind}`,
    },
  )
}

/** Builds species trait and selected-heritage grant ChoiceSets at level 1. */
export function resolveSpeciesTraitGrantChoiceSets(
  draft: CharacterBuilderDraft,
  catalogIndex: CharacterBuildCatalogIndex,
): ChoiceSet[] {
  const speciesId = draft.species.speciesId
  if (!speciesId) return []

  const species = catalogIndex.species.get(speciesId)
  if (!species) return []

  const choiceSets = species.traits.flatMap((trait) =>
    traitGrantChoiceSets(trait, species.id, catalogIndex, trait.id),
  )

  const heritageOptionId = resolveSelectedHeritageOptionId(draft, species)
  if (heritageOptionId && species.heritage) {
    const heritageOption = species.heritage.options.find((option) => option.id === heritageOptionId)
    if (heritageOption) {
      choiceSets.push(
        ...traitGrantChoiceSets(
          heritageOption,
          species.id,
          catalogIndex,
          `heritage:${heritageOptionId}`,
        ),
      )
    }
  }

  return choiceSets
}
