import type { Spellcasting } from '../../content/classes/spellcasting'
import { getSlotRow, SLOT_TABLES } from '../../content/spell-slots'

// ---------------------------------------------------------------------------
// Creature spellcasting primitives — level progression math from class
// spellcasting blocks. Reusable across character, NPC, and monster surfaces;
// no builder or character-sheet dependencies.
// ---------------------------------------------------------------------------

export type CreatureSpellcastingFacts = {
  cantripsKnown: number
  spellsAvailable: number
  maxSelectableSpellLevel: number
}

function progressionValueAtLevel<T extends { level: number }>(
  entries: readonly T[] | undefined,
  classLevel: number,
  getValue: (entry: T) => number,
): number {
  if (!entries?.length) return 0

  return entries
    .filter((entry) => entry.level <= classLevel)
    .reduce((best, entry) => Math.max(best, getValue(entry)), 0)
}

export function cantripsKnownAtLevel(spellcasting: Spellcasting, classLevel: number): number {
  return progressionValueAtLevel(spellcasting.cantrips, classLevel, (entry) => entry.known)
}

export function spellsAvailableAtLevel(spellcasting: Spellcasting, classLevel: number): number {
  return progressionValueAtLevel(spellcasting.spellsAvailable, classLevel, (entry) => entry.count)
}

/** Highest spell level with at least one slot at the given character level. */
export function maxSelectableSpellLevel(spellcasting: Spellcasting, classLevel: number): number {
  const row = getSlotRow(SLOT_TABLES[spellcasting.progression], classLevel) ?? []
  let maxLevel = 0

  for (let index = 0; index < row.length; index++) {
    if ((row[index] ?? 0) > 0) {
      maxLevel = index + 1
    }
  }

  return maxLevel
}

/** Resolves cantrip, spell, and slot-cap facts for a class level. */
export function resolveSpellcastingFactsAtLevel(
  spellcasting: Spellcasting,
  classLevel: number,
): CreatureSpellcastingFacts {
  return {
    cantripsKnown: cantripsKnownAtLevel(spellcasting, classLevel),
    spellsAvailable: spellsAvailableAtLevel(spellcasting, classLevel),
    maxSelectableSpellLevel: maxSelectableSpellLevel(spellcasting, classLevel),
  }
}
