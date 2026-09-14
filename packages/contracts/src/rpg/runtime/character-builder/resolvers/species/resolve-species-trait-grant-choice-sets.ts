import {
  isEffectiveAvailable,
  resolveDefaultSpeciesAccess,
  resolveEffectiveCampaignAccess,
  resolveEffectiveSpeciesTraitAccess,
} from '../../../../content/lib/campaign-access'
import type { ContentTrait } from '../../../../content/lib/grants'
import type { Species } from '../../../../content/species'
import { isContentPlayableFor } from '../../../campaign/content-resolution-policy'
import type { ChoiceSet } from '../../choice-set'
import type { CharacterBuildCatalogIndex, CharacterBuildContext } from '../../context'
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

type SpeciesWithAccess = Species & {
  campaignAccess?: ReturnType<typeof resolveDefaultSpeciesAccess>
}

/** Builds species trait and selected-heritage grant ChoiceSets at level 1. */
export function resolveSpeciesTraitGrantChoiceSets(
  draft: CharacterBuilderDraft,
  catalogIndex: CharacterBuildCatalogIndex,
  context: CharacterBuildContext,
): ChoiceSet[] {
  const speciesId = draft.species.speciesId
  if (!speciesId) return []

  const species = catalogIndex.species.get(speciesId) as SpeciesWithAccess | undefined
  if (!species) return []

  const speciesAccess = resolveDefaultSpeciesAccess(species.campaignAccess)

  const choiceSets = species.traits.flatMap((trait) => {
    const effective = resolveEffectiveSpeciesTraitAccess(speciesAccess, trait)
    if (!isEffectiveAvailable(effective)) return []
    if (!isContentPlayableFor({ campaignAccess: effective }, context.playActor)) return []
    return traitGrantChoiceSets(trait, species.id, catalogIndex, trait.id)
  })

  const heritageOptionId = resolveSelectedHeritageOptionId(draft, species)
  if (heritageOptionId && species.heritage) {
    const heritageOption = species.heritage.options.find((option) => option.id === heritageOptionId)
    if (heritageOption) {
      const effective = resolveEffectiveCampaignAccess(speciesAccess, heritageOption.campaignAccess)
      if (
        isEffectiveAvailable(effective) &&
        isContentPlayableFor({ campaignAccess: effective }, context.playActor)
      ) {
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
  }

  return choiceSets
}
