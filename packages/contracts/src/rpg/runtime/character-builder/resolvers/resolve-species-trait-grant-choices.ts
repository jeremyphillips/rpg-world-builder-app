import type { ChoiceSourceResolver } from './choice-source-resolver'
import { resolveSpeciesTraitGrantChoiceSets } from './resolve-species-trait-grant-choice-sets'

/** Exposes species trait and heritage grant choices as builder ChoiceSets. */
export const resolveSpeciesTraitGrantChoices: ChoiceSourceResolver = (
  draft,
  _context,
  catalogIndex,
) => resolveSpeciesTraitGrantChoiceSets(draft, catalogIndex)
