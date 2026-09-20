import { isSpellcastingActiveAtLevel, type Spellcasting } from '../../content/classes/spellcasting'
import type { ResolvedSpellcastingProgressionConfig } from '../../campaign/rules/spellcasting-progression'
import { resolveProgressionValueAtLevel } from '../../campaign/rules/spellcasting-progression/lookup'
import {
  resolveMaxSelectableSpellLevelFromProfile,
  resolveSpellcastingProfileForSpellcasting,
  resolveSpellsAvailableFromProfile,
} from '../../campaign/rules/spellcasting-progression'

// ---------------------------------------------------------------------------
// Creature spellcasting primitives — level progression math from resolved
// spellcasting profiles. Reusable across character, NPC, and monster surfaces.
// ---------------------------------------------------------------------------

export type CreatureSpellcastingFacts = {
  cantripsKnown: number
  spellsAvailable: number
  maxSelectableSpellLevel: number
}

/** Builder-facing cantrip quota from the class spellcasting record (0 when absent or inactive). */
export function resolveClassCantripCount(input: {
  spellcasting: Spellcasting | undefined
  classLevel: number
}): number {
  const { spellcasting, classLevel } = input
  if (!spellcasting?.cantrips || !isSpellcastingActiveAtLevel(spellcasting, classLevel)) {
    return 0
  }

  return resolveProgressionValueAtLevel({
    kind: 'capacity',
    rows: spellcasting.cantrips.curve.rows,
    level: classLevel,
    extension: spellcasting.cantrips.extension,
  }).count
}

export function cantripsKnownAtLevel(spellcasting: Spellcasting, classLevel: number): number {
  return resolveClassCantripCount({ spellcasting, classLevel })
}

export function spellsAvailableAtLevel(
  spellcasting: Spellcasting,
  classLevel: number,
  config: ResolvedSpellcastingProgressionConfig,
): number {
  const bundle = resolveSpellcastingProfileForSpellcasting(spellcasting, config)
  if (!bundle) return 0
  return resolveSpellsAvailableFromProfile(bundle.profile, classLevel)
}

/** Highest spell level with at least one slot at the given character level. */
export function maxSelectableSpellLevel(
  spellcasting: Spellcasting,
  classLevel: number,
  config: ResolvedSpellcastingProgressionConfig,
): number {
  const bundle = resolveSpellcastingProfileForSpellcasting(spellcasting, config)
  if (!bundle) return 0
  return resolveMaxSelectableSpellLevelFromProfile(bundle, classLevel)
}

/** Resolves cantrip, spell, and slot-cap facts for a class level. */
export function resolveSpellcastingFactsAtLevel(
  spellcasting: Spellcasting,
  classLevel: number,
  config: ResolvedSpellcastingProgressionConfig,
): CreatureSpellcastingFacts {
  return {
    cantripsKnown: cantripsKnownAtLevel(spellcasting, classLevel),
    spellsAvailable: spellsAvailableAtLevel(spellcasting, classLevel, config),
    maxSelectableSpellLevel: maxSelectableSpellLevel(spellcasting, classLevel, config),
  }
}
