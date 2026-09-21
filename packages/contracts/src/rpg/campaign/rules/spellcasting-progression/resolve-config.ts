import type { SpellcastingProgressionSeed } from './patch'
import { indexSpellcastingProgressionRecords } from './patch'
import type { SlotProgression } from './slot-progression'

// ---------------------------------------------------------------------------
// Slot progression resolution — ruleset slot tables referenced by classes.
// ---------------------------------------------------------------------------

export type ResolvedSpellcastingProgressionConfig = ReturnType<
  typeof indexSpellcastingProgressionRecords
>

export function resolveSpellcastingProgressionConfig(
  seed: SpellcastingProgressionSeed,
): ResolvedSpellcastingProgressionConfig {
  return indexSpellcastingProgressionRecords(seed)
}

/** Resolves a class spellcasting block to its slot progression record. */
export function resolveSlotProgressionForClass(
  characterClass: { spellcasting?: { slotProgressionId?: string } | null },
  config: ResolvedSpellcastingProgressionConfig,
): SlotProgression | null {
  const slotProgressionId = characterClass.spellcasting?.slotProgressionId
  if (!slotProgressionId) return null
  return config.slotProgressions.get(slotProgressionId) ?? null
}

export function resolveSlotProgressionForSpellcasting(
  spellcasting: { slotProgressionId: string },
  config: ResolvedSpellcastingProgressionConfig,
): SlotProgression | null {
  return config.slotProgressions.get(spellcasting.slotProgressionId) ?? null
}
