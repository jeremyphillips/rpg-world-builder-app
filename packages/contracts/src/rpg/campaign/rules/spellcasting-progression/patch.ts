import { z } from 'zod'

import { slotProgressionSchema } from './slot-progression'
import { spellcastingProfileSchema } from './spellcasting-profile'

// ---------------------------------------------------------------------------
// Campaign sparse patch — overrides/additions keyed by record id.
// ---------------------------------------------------------------------------

export const spellcastingProgressionPatchSchema = z
  .object({
    slotProgressions: z.array(slotProgressionSchema).optional(),
    profiles: z.array(spellcastingProfileSchema).optional(),
  })
  .strict()

export type SpellcastingProgressionPatch = z.infer<typeof spellcastingProgressionPatchSchema>

export type SpellcastingProgressionSeed = {
  slotProgressions: readonly SlotProgressionFromSeed[]
  profiles: readonly SpellcastingProfileFromSeed[]
}

type SlotProgressionFromSeed = z.infer<typeof slotProgressionSchema>
type SpellcastingProfileFromSeed = z.infer<typeof spellcastingProfileSchema>

function mergeById<T extends { id: string }>(
  seed: readonly T[],
  patch: readonly T[] | undefined,
): T[] {
  const map = new Map(seed.map((entry) => [entry.id, entry]))
  for (const entry of patch ?? []) {
    map.set(entry.id, entry)
  }
  return [...map.values()]
}

export function resolveSpellcastingProgressionRecords(
  seed: SpellcastingProgressionSeed,
  patch: SpellcastingProgressionPatch | undefined,
): SpellcastingProgressionSeed {
  return {
    slotProgressions: mergeById(seed.slotProgressions, patch?.slotProgressions),
    profiles: mergeById(seed.profiles, patch?.profiles),
  }
}

export function indexSpellcastingProgressionRecords(seed: SpellcastingProgressionSeed): {
  slotProgressions: ReadonlyMap<string, SlotProgressionFromSeed>
  profiles: ReadonlyMap<string, SpellcastingProfileFromSeed>
} {
  return {
    slotProgressions: new Map(seed.slotProgressions.map((entry) => [entry.id, entry])),
    profiles: new Map(seed.profiles.map((entry) => [entry.id, entry])),
  }
}
