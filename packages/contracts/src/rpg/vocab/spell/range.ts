import { z } from 'zod'

import { vocabEnumFromEntries, keysFromEntries } from '../enum-schema'
import type { GameTermEntry, VocabularyTerm } from '../types'

/** Units for a published spell distance. Miles stay miles — not a feet sentinel. */
export const SPELL_RANGE_DISTANCE_UNITS = ['ft', 'mi'] as const

export type SpellRangeDistanceUnit = (typeof SPELL_RANGE_DISTANCE_UNITS)[number]

export const spellRangeDistanceUnitSchema = z.enum(SPELL_RANGE_DISTANCE_UNITS)

/**
 * Spell range distance. Any positive amount is valid. Foot and mile preset
 * lists are authoring suggestions, not this schema.
 */
export const spellRangeDistanceSchema = z.object({
  value: z.number().positive(),
  unit: spellRangeDistanceUnitSchema,
})

export type SpellRangeDistance = z.infer<typeof spellRangeDistanceSchema>

// ---------------------------------------------------------------------------
// Spell range kinds — closed SRD set for spell metadata.
// ---------------------------------------------------------------------------

export const SPELL_RANGE_KIND_TERM = {
  label: 'Spell Range',
  description: 'How far or to whom a spell can reach.',
  sentence: {
    singular: 'spell range',
    plural: 'spell ranges',
  },
} as const satisfies VocabularyTerm

export const SPELL_RANGE_KIND_ENTRIES = {
  self: { label: 'Self', description: 'The spell affects only the caster.' },
  touch: { label: 'Touch', description: 'The spell requires touching a target.' },
  sight: { label: 'Sight', description: 'The spell requires seeing the target or point.' },
  distance: {
    label: 'Distance',
    description: 'The spell reaches a point or target within a measured distance.',
  },
  unlimited: { label: 'Unlimited', description: 'The spell has no range limit.' },
  special: {
    label: 'Special',
    description: 'The spell has a non-standard range described in the rules text.',
  },
} as const satisfies Record<string, GameTermEntry>

export type SpellRangeKind = keyof typeof SPELL_RANGE_KIND_ENTRIES

export const SPELL_RANGE_KINDS = keysFromEntries(SPELL_RANGE_KIND_ENTRIES)

export const spellRangeKindSchema = vocabEnumFromEntries(SPELL_RANGE_KIND_ENTRIES)

const spellRangeSelfSchema = z.object({ kind: z.literal('self') })
const spellRangeTouchSchema = z.object({ kind: z.literal('touch') })
const spellRangeSightSchema = z.object({ kind: z.literal('sight') })
const spellRangeUnlimitedSchema = z.object({ kind: z.literal('unlimited') })
const spellRangeDistanceKindSchema = z.object({
  kind: z.literal('distance'),
  value: spellRangeDistanceSchema,
})
const spellRangeSpecialSchema = z.object({
  kind: z.literal('special'),
  description: z.string().min(1),
})

export const spellRangeSchema = z.discriminatedUnion('kind', [
  spellRangeSelfSchema,
  spellRangeTouchSchema,
  spellRangeSightSchema,
  spellRangeUnlimitedSchema,
  spellRangeDistanceKindSchema,
  spellRangeSpecialSchema,
])

export type SpellRange = z.infer<typeof spellRangeSchema>

/** Returns the display label for a spell range kind. Falls back to the raw value. */
export function getSpellRangeKindLabel(kind: string): string {
  return SPELL_RANGE_KIND_ENTRIES[kind as SpellRangeKind]?.label ?? kind
}
