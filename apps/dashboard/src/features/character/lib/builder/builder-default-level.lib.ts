import { resolveCharacterLevelConstraints, type CharacterBuildContext } from '@rpg/contracts'

/** Full builder default: level 1 when allowed, otherwise campaign minimum (not quick-NPC default). */
export function resolveFullBuilderDefaultLevel(context: CharacterBuildContext): number {
  const { minLevel, maxLevel, allowedLevels } = resolveCharacterLevelConstraints({
    characterKind: context.characterKind,
    rulesScope: context.rulesScope,
    characterCreationRules: context.characterCreationRules,
  })
  const preferred = 1

  if (preferred >= minLevel && preferred <= maxLevel) {
    if (!allowedLevels || allowedLevels.includes(preferred)) {
      return preferred
    }
  }

  return minLevel
}
