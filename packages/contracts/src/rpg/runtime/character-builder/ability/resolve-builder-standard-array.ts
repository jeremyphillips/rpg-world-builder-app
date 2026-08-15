import type { StandardArray } from '../../../primitives/standard-array'
import type { CharacterBuildContext } from '../context'

// ---------------------------------------------------------------------------
// Standard array resolution — level + context, not draft.
// PC and Level 0 NPC arrays are separate campaign fields; this resolver picks
// the correct array at call time via resolveBuilderStandardArray(context, level).
// ---------------------------------------------------------------------------

/** True when level 0 should use the Level 0 NPC standard array (not merely "level is 0"). */
export function usesLevelZeroStandardArray(context: CharacterBuildContext, level: number): boolean {
  return (
    level === 0 &&
    context.characterKind === 'npc' &&
    context.characterCreationRules.levelZeroNpcs.enabled
  )
}

export function resolveBuilderStandardArray(
  context: CharacterBuildContext,
  level: number,
): StandardArray {
  if (usesLevelZeroStandardArray(context, level)) {
    return context.characterCreationRules.levelZeroNpcs.standardArray
  }
  return context.characterCreationRules.abilityGeneration.standardArray
}
