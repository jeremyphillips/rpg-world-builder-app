import type { ChoiceSourceResolver } from './choice-source-resolver'
import { isClassProgressionApplicable } from '../../progression/character-level-policy'

/** Skips class-owned choice sources when class progression does not apply (Level 0). */
export function whenClassProgressionApplicable(
  resolver: ChoiceSourceResolver,
): ChoiceSourceResolver {
  return (draft, context, catalogIndex) =>
    isClassProgressionApplicable(draft.class.level) ? resolver(draft, context, catalogIndex) : []
}
