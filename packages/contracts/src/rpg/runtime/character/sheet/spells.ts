import { z } from 'zod'

import {
  spellCollectionKindSchema,
  type SpellCollectionKind,
} from '../../../vocab/spell/spell-collection-kind'
import { usageFrequencySchema } from '../../../vocab/usage-frequency'
import { characterSelectionSourcesSchema } from './selection-sources'

// ---------------------------------------------------------------------------
// Runtime spell list entries on a character sheet.
// ---------------------------------------------------------------------------

export const characterSpellAccessSchema = z.object({
  /** @deprecated Prefer `collections` membership for class spellcasting rows. */
  classKnown: z.boolean().optional(),
  alwaysPrepared: z.boolean().optional(),
  granted: z.boolean().optional(),
})

export type CharacterSpellAccess = z.infer<typeof characterSpellAccessSchema>

/** @deprecated Prefer `collections` with kind `prepared`. */
export const characterSpellSelectionSchema = z.object({
  prepared: z.boolean(),
})

export type CharacterSpellSelection = z.infer<typeof characterSpellSelectionSchema>

export const characterSpellCollectionMembershipSchema = z.object({
  kind: spellCollectionKindSchema,
  /** When true, builder initial loadout picks may change per profile mutation policy. */
  mutable: z.boolean().optional(),
})

export type CharacterSpellCollectionMembership = z.infer<
  typeof characterSpellCollectionMembershipSchema
>

export const characterSpellCastingEntitlementSchema = z.object({
  mode: z.literal('free_cast'),
  frequency: usageFrequencySchema,
  allowsSlotCasting: z.boolean(),
  sources: characterSelectionSourcesSchema,
})

export type CharacterSpellCastingEntitlement = z.infer<
  typeof characterSpellCastingEntitlementSchema
>

export const characterSpellEntrySchema = z.object({
  spellId: z.string().min(1),
  sources: characterSelectionSourcesSchema,
  access: characterSpellAccessSchema,
  collections: z.array(characterSpellCollectionMembershipSchema).optional(),
  /** @deprecated Prefer `collections` with kind `prepared`. */
  selection: characterSpellSelectionSchema.optional(),
  castingEntitlements: z.array(characterSpellCastingEntitlementSchema).optional(),
  notes: z.string().optional(),
})

export type CharacterSpellEntry = z.infer<typeof characterSpellEntrySchema>

export function characterSpellHasCollection(
  entry: CharacterSpellEntry,
  kind: SpellCollectionKind,
): boolean {
  return entry.collections?.some((membership) => membership.kind === kind) ?? false
}

/** Whether the spell is in the prepared loadout (collections or legacy selection). */
export function characterSpellIsPrepared(entry: CharacterSpellEntry): boolean {
  if (characterSpellHasCollection(entry, 'prepared')) return true
  return entry.selection?.prepared === true
}

export function mergeCharacterSpellCollections(
  existing: readonly CharacterSpellCollectionMembership[] | undefined,
  incoming: readonly CharacterSpellCollectionMembership[],
): CharacterSpellCollectionMembership[] {
  const merged = [...(existing ?? [])]
  for (const membership of incoming) {
    const index = merged.findIndex((entry) => entry.kind === membership.kind)
    if (index === -1) {
      merged.push(membership)
      continue
    }
    merged[index] = { ...merged[index], ...membership }
  }
  return merged
}
