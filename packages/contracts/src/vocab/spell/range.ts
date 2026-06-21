import { z } from 'zod'

import { distanceSchema } from '../../primitives/units'

import type { GameTermEntry } from '../types'

// ---------------------------------------------------------------------------
// Spell range kinds — closed SRD set for spell metadata.
// ---------------------------------------------------------------------------

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

export const SPELL_RANGE_KINDS = Object.keys(SPELL_RANGE_KIND_ENTRIES) as [
  SpellRangeKind,
  ...SpellRangeKind[],
]

export const spellRangeKindSchema = z.enum(SPELL_RANGE_KINDS)

const spellRangeSelfSchema = z.object({ kind: z.literal('self') })
const spellRangeTouchSchema = z.object({ kind: z.literal('touch') })
const spellRangeSightSchema = z.object({ kind: z.literal('sight') })
const spellRangeUnlimitedSchema = z.object({ kind: z.literal('unlimited') })
const spellRangeDistanceSchema = z.object({
  kind: z.literal('distance'),
  value: distanceSchema,
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
  spellRangeDistanceSchema,
  spellRangeSpecialSchema,
])

export type SpellRange = z.infer<typeof spellRangeSchema>

/** Returns the display label for a spell range kind. Falls back to the raw value. */
export function getSpellRangeKindLabel(kind: string): string {
  return SPELL_RANGE_KIND_ENTRIES[kind as SpellRangeKind]?.label ?? kind
}
