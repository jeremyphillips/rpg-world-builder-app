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

function recordDiffersFromSeed<T>(record: T, seedRecord: T | undefined): boolean {
  if (seedRecord === undefined) return true
  return JSON.stringify(record) !== JSON.stringify(seedRecord)
}

/** Returns sparse patch entries that differ from seed; undefined when no customization. */
export function computeSpellcastingProgressionSparsePatch(
  resolved: SpellcastingProgressionSeed,
  seed: SpellcastingProgressionSeed,
): SpellcastingProgressionPatch | undefined {
  const seedSlotById = new Map(seed.slotProgressions.map((entry) => [entry.id, entry]))
  const seedProfileById = new Map(seed.profiles.map((entry) => [entry.id, entry]))

  const slotProgressions = resolved.slotProgressions.filter((entry) =>
    recordDiffersFromSeed(entry, seedSlotById.get(entry.id)),
  )
  const profiles = resolved.profiles.filter((entry) =>
    recordDiffersFromSeed(entry, seedProfileById.get(entry.id)),
  )

  if (slotProgressions.length === 0 && profiles.length === 0) return undefined

  return {
    ...(slotProgressions.length > 0 ? { slotProgressions } : {}),
    ...(profiles.length > 0 ? { profiles } : {}),
  }
}

/** Empty patch shape used to clear stored spellcasting overrides on save. */
export const EMPTY_SPELLCASTING_PROGRESSION_PATCH: SpellcastingProgressionPatch = {
  slotProgressions: [],
  profiles: [],
}
