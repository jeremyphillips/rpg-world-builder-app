import { resolveLanguageChoiceSets } from './resolve-language-choice-sets'
import type { ChoiceSourceResolver } from '../registry/choice-source-resolver'

/** Exposes ruleset-level origin language choices as builder ChoiceSets. */
export const resolveRulesetLanguageChoices: ChoiceSourceResolver = (draft, context) =>
  resolveLanguageChoiceSets(draft, context)
