import { resolveLanguageChoiceSets } from './resolve-languages'
import type { ChoiceSourceResolver } from './choice-source-resolver'

/** Exposes ruleset-level origin language choices as builder ChoiceSets. */
export const resolveRulesetLanguageChoices: ChoiceSourceResolver = (
  _draft,
  context,
  catalogIndex,
) => resolveLanguageChoiceSets(context, catalogIndex)
