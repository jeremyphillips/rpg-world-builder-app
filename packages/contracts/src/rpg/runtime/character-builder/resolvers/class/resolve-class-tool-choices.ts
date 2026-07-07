import type { ChoiceSourceResolver } from '../registry/choice-source-resolver'
import { resolveClassToolChoiceSets } from './resolve-class-tool-choice-sets'

/** Exposes class tool proficiency choices as builder ChoiceSets. */
export const resolveClassToolChoices: ChoiceSourceResolver = (draft, _context, catalogIndex) =>
  resolveClassToolChoiceSets(draft, catalogIndex)
