import { resolveCharacterLevelConstraints, type CharacterBuildContext } from '@rpg/contracts'

/** Full builder default: level 1 when allowed, otherwise campaign minimum. */
export function resolveFullBuilderDefaultLevel(context: CharacterBuildContext): number {
  const { minLevel, maxLevel, allowedLevels } = resolveCharacterLevelConstraints(context)
  const preferred = 1

  if (preferred >= minLevel && preferred <= maxLevel) {
    if (!allowedLevels || allowedLevels.includes(preferred)) {
      return preferred
    }
  }

  return minLevel
}
