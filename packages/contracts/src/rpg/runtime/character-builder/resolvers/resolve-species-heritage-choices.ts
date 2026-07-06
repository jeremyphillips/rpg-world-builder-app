import type { ChoiceSourceResolver } from './choice-source-resolver'
import { resolveSpeciesHeritageChoiceSets } from './resolve-species-heritage-choice-sets'

/** Exposes species heritage trait choices as builder ChoiceSets. */
export const resolveSpeciesHeritageChoices: ChoiceSourceResolver = (
  draft,
  _context,
  catalogIndex,
) => resolveSpeciesHeritageChoiceSets(draft, catalogIndex)
