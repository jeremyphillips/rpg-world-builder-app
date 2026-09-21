import {
  isSpellcastingActiveAtLevel,
  type ClassSpellcastingActivationSource,
  type Spellcasting,
} from '../../content/classes/spellcasting'
import type { ResolvedSpellcastingProgressionConfig } from '../../campaign/rules/spellcasting-progression'
import { resolveProgressionValueAtLevel } from '../../campaign/rules/spellcasting-progression/lookup'
import {
  resolveClassSpellcastingForSpellcasting,
  resolveMaxSelectableSpellLevelFromClass,
  resolveSpellsAvailableFromClass,
} from './resolve-class-spellcasting'

// ---------------------------------------------------------------------------
// Creature spellcasting primitives — level progression math from resolved
// class spellcasting. Reusable across character, NPC, and monster surfaces.
// ---------------------------------------------------------------------------

export type CreatureSpellcastingFacts = {
  cantripsKnown: number
  spellsAvailable: number
  maxSelectableSpellLevel: number
}

/** Builder-facing cantrip quota from the class spellcasting record (0 when absent or inactive). */
export function resolveClassCantripCount(input: {
  source: ClassSpellcastingActivationSource
  classLevel: number
  runtime?: boolean
}): number {
  const { source, classLevel, runtime } = input
  const cantrips = source.spellcasting?.progression?.cantrips
  if (!cantrips || !isSpellcastingActiveAtLevel(source, classLevel, { runtime })) {
    return 0
  }

  return resolveProgressionValueAtLevel({
    kind: 'capacity',
    rows: cantrips.curve.rows,
    level: classLevel,
    extension: cantrips.extension,
  }).count
}

export function cantripsKnownAtLevel(
  source: ClassSpellcastingActivationSource,
  classLevel: number,
): number {
  return resolveClassCantripCount({ source, classLevel })
}

export function spellsAvailableAtLevel(
  spellcasting: Spellcasting,
  classLevel: number,
  config: ResolvedSpellcastingProgressionConfig,
): number {
  const resolved = resolveClassSpellcastingForSpellcasting(spellcasting, config)
  if (!resolved) return 0
  return resolveSpellsAvailableFromClass(resolved, classLevel)
}

/** Highest spell level with at least one slot at the given character level. */
export function maxSelectableSpellLevel(
  spellcasting: Spellcasting,
  classLevel: number,
  config: ResolvedSpellcastingProgressionConfig,
): number {
  const resolved = resolveClassSpellcastingForSpellcasting(spellcasting, config)
  if (!resolved) return 0
  return resolveMaxSelectableSpellLevelFromClass(resolved, classLevel)
}

/** Resolves cantrip, spell, and slot-cap facts for a class level. */
export function resolveSpellcastingFactsAtLevel(
  source: ClassSpellcastingActivationSource,
  classLevel: number,
  config: ResolvedSpellcastingProgressionConfig,
): CreatureSpellcastingFacts {
  const spellcasting = source.spellcasting
  if (!spellcasting) {
    return { cantripsKnown: 0, spellsAvailable: 0, maxSelectableSpellLevel: 0 }
  }

  return {
    cantripsKnown: cantripsKnownAtLevel(source, classLevel),
    spellsAvailable: spellsAvailableAtLevel(spellcasting, classLevel, config),
    maxSelectableSpellLevel: maxSelectableSpellLevel(spellcasting, classLevel, config),
  }
}
