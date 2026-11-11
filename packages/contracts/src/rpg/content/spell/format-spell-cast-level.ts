/**
 * Shared wording for casting a spell above its own level.
 * Compact names use `Fireball (level 5 version)`.
 * Prose uses `the level 5 version of Magic Missile`.
 */

function spellCastLevelVersionLabel(castAtLevel: number): string {
  return `level ${castAtLevel} version`
}

function spellCastLevelVersion(
  castAtLevel: number | undefined,
  spellLevel: number | undefined,
): string | undefined {
  if (castAtLevel === undefined) return undefined
  if (spellLevel !== undefined && castAtLevel <= spellLevel) return undefined
  return spellCastLevelVersionLabel(castAtLevel)
}

/** Compact name. The spell's own level, or a higher cast, prints without a suffix. */
export function formatSpellCastAtLevelName(input: {
  name: string
  castAtLevel?: number
  spellLevel?: number
}): string {
  const version = spellCastLevelVersion(input.castAtLevel, input.spellLevel)
  if (!version) return input.name
  return `${input.name} (${version})`
}

/**
 * Prose casting: "the level 5 version of Magic Missile", or "the level 3 version of the spell"
 * when the sentence already identified the spell. Unlike the compact name, this still prints
 * when the cast level is the spell's own level.
 */
export function formatSpellCastAtLevelOf(input: { castAtLevel: number; name?: string }): string {
  const version = spellCastLevelVersionLabel(input.castAtLevel)
  return `the ${version} of ${input.name ?? 'the spell'}`
}
