import { z } from 'zod'

import { rollSchema } from '../../../../primitives/mechanics/roll'

// ---------------------------------------------------------------------------
// Spell resolution progression — nested on resolution; models scaling of
// resolution-owned effects and counts only (initial scope).
// ---------------------------------------------------------------------------

const progressionEffectIdSchema = z.string().min(1)

export const SPELL_RESOLUTION_PROGRESSION_BASES = ['character-level', 'spell-slot-level'] as const

export type SpellResolutionProgressionBasis = (typeof SPELL_RESOLUTION_PROGRESSION_BASES)[number]

export const spellResolutionProgressionBasisSchema = z.enum(SPELL_RESOLUTION_PROGRESSION_BASES)

export const SPELL_RESOLUTION_PROGRESSION_SUBJECT_KINDS = [
  'effect',
  'application-pattern',
  'target',
] as const

export type SpellResolutionProgressionSubjectKind =
  (typeof SPELL_RESOLUTION_PROGRESSION_SUBJECT_KINDS)[number]

export const spellResolutionProgressionEffectSubjectSchema = z.object({
  kind: z.literal('effect'),
  effectId: progressionEffectIdSchema,
})

export const spellResolutionProgressionApplicationPatternSubjectSchema = z.object({
  kind: z.literal('application-pattern'),
})

export const spellResolutionProgressionTargetSubjectSchema = z.object({
  kind: z.literal('target'),
})

export const spellResolutionProgressionSubjectSchema = z.discriminatedUnion('kind', [
  spellResolutionProgressionEffectSubjectSchema,
  spellResolutionProgressionApplicationPatternSubjectSchema,
  spellResolutionProgressionTargetSubjectSchema,
])

export type SpellResolutionProgressionSubject = z.infer<
  typeof spellResolutionProgressionSubjectSchema
>

export const SPELL_RESOLUTION_PROGRESSION_PROPERTIES = [
  'roll',
  'projectile-count',
  'selected-target-count',
] as const

export type SpellResolutionProgressionProperty =
  (typeof SPELL_RESOLUTION_PROGRESSION_PROPERTIES)[number]

export const spellResolutionProgressionPropertySchema = z.enum(
  SPELL_RESOLUTION_PROGRESSION_PROPERTIES,
)

export const spellResolutionProgressionReferenceSchema = z.object({
  subject: spellResolutionProgressionSubjectSchema,
  property: spellResolutionProgressionPropertySchema,
})

export type SpellResolutionProgressionReference = z.infer<
  typeof spellResolutionProgressionReferenceSchema
>

export const spellResolutionProgressionRollValueSchema = z.object({
  kind: z.literal('roll'),
  roll: rollSchema,
})

export const spellResolutionProgressionCountValueSchema = z.object({
  kind: z.literal('count'),
  count: z.number().int().min(1),
})

export const spellResolutionProgressionValueSchema = z.discriminatedUnion('kind', [
  spellResolutionProgressionRollValueSchema,
  spellResolutionProgressionCountValueSchema,
])

export type SpellResolutionProgressionValue = z.infer<typeof spellResolutionProgressionValueSchema>

export const spellResolutionProgressionThresholdEntrySchema = z.object({
  threshold: z.number().int().min(1),
  value: spellResolutionProgressionValueSchema,
})

export type SpellResolutionProgressionThresholdEntry = z.infer<
  typeof spellResolutionProgressionThresholdEntrySchema
>

export const spellResolutionProgressionThresholdTrackSchema = z.object({
  kind: z.literal('thresholds'),
  reference: spellResolutionProgressionReferenceSchema,
  entries: z.array(spellResolutionProgressionThresholdEntrySchema).min(1),
})

export const spellResolutionProgressionLinearTrackSchema = z.object({
  kind: z.literal('linear'),
  reference: spellResolutionProgressionReferenceSchema,
  increment: spellResolutionProgressionValueSchema,
})

export const spellResolutionProgressionTrackSchema = z.discriminatedUnion('kind', [
  spellResolutionProgressionThresholdTrackSchema,
  spellResolutionProgressionLinearTrackSchema,
])

export type SpellResolutionProgressionTrack = z.infer<typeof spellResolutionProgressionTrackSchema>

export const spellResolutionProgressionSchema = z.object({
  basis: spellResolutionProgressionBasisSchema,
  tracks: z.array(spellResolutionProgressionTrackSchema).min(1),
})

export type SpellResolutionProgression = z.infer<typeof spellResolutionProgressionSchema>

/** Closed subject/property pairings for progression references. */
export const VALID_SPELL_RESOLUTION_PROGRESSION_REFERENCE_PAIRS = [
  { subjectKind: 'effect', property: 'roll' },
  { subjectKind: 'application-pattern', property: 'projectile-count' },
  { subjectKind: 'target', property: 'selected-target-count' },
] as const satisfies ReadonlyArray<{
  subjectKind: SpellResolutionProgressionSubjectKind
  property: SpellResolutionProgressionProperty
}>

export function isValidSpellResolutionProgressionReferencePair(
  subject: SpellResolutionProgressionSubject,
  property: SpellResolutionProgressionProperty,
): boolean {
  return VALID_SPELL_RESOLUTION_PROGRESSION_REFERENCE_PAIRS.some(
    (pair) => pair.subjectKind === subject.kind && pair.property === property,
  )
}
