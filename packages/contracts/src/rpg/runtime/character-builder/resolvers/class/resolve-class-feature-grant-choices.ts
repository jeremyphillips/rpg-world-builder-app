import type { ChoiceSourceResolver } from '../registry/choice-source-resolver'
import { resolveClassFeatureGrantChoiceSets } from './resolve-class-feature-grant-choice-sets'

/** Exposes L1 class feature grant choices as builder ChoiceSets. */
export const resolveClassFeatureGrantChoices: ChoiceSourceResolver = (
  draft,
  _context,
  catalogIndex,
) => resolveClassFeatureGrantChoiceSets(draft, catalogIndex)
