import type { ChoiceSourceResolver } from '../registry/choice-source-resolver'
import { resolveClassSkillChoiceSets } from './resolve-class-skill-choice-sets'

/** Exposes class skill proficiency choices as builder ChoiceSets. */
export const resolveClassSkillChoices: ChoiceSourceResolver = (draft, _context, catalogIndex) =>
  resolveClassSkillChoiceSets(draft, catalogIndex)
