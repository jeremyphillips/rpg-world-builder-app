import type { ChoiceSourceResolver } from '../registry/choice-source-resolver'
import { isBuilderLevelZeroClassless } from '../../progression/character-level-policy'
import { resolveSpeciesTraitGrantChoiceSets } from './resolve-species-trait-grant-choice-sets'

/** Exposes species trait and heritage grant choices as builder ChoiceSets. */
export const resolveSpeciesTraitGrantChoices: ChoiceSourceResolver = (
  draft,
  context,
  catalogIndex,
) => {
  if (
    isBuilderLevelZeroClassless(draft, context) &&
    !context.characterCreationRules.levelZeroNpcs.retainSpeciesTraits
  ) {
    return []
  }

  return resolveSpeciesTraitGrantChoiceSets(draft, catalogIndex)
}
