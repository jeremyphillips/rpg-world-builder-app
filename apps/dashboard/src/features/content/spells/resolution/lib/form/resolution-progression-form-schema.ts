import { z } from 'zod'

import { rollFormObjectSchema } from '../../../../lib/forms/mechanics/roll-form-values'

export const PROGRESSION_TRACK_KINDS = ['thresholds', 'linear'] as const

export type ProgressionTrackKind = (typeof PROGRESSION_TRACK_KINDS)[number]

export const PROGRESSION_REFERENCE_SUBJECT_KINDS = [
  'effect',
  'application-pattern',
  'target',
] as const

export type ProgressionReferenceSubjectKind = (typeof PROGRESSION_REFERENCE_SUBJECT_KINDS)[number]

export const PROGRESSION_REFERENCE_PROPERTIES = [
  'roll',
  'projectile-count',
  'selected-target-count',
] as const

export type ProgressionReferenceProperty = (typeof PROGRESSION_REFERENCE_PROPERTIES)[number]

export const progressionThresholdEntryFormSchema = z.object({
  threshold: z.coerce.number().int().min(1),
  valueKind: z.enum(['roll', 'count']),
  roll: rollFormObjectSchema.optional(),
  count: z.coerce.number().int().min(1).optional(),
})

export type ProgressionThresholdEntryFormItem = z.infer<typeof progressionThresholdEntryFormSchema>

export const progressionTrackFormItemSchema = z.object({
  trackId: z.string().min(1),
  kind: z.enum(PROGRESSION_TRACK_KINDS),
  referenceSubjectKind: z.enum(PROGRESSION_REFERENCE_SUBJECT_KINDS),
  referenceEffectId: z.string().optional(),
  referenceProperty: z.enum(PROGRESSION_REFERENCE_PROPERTIES),
  entries: z.array(progressionThresholdEntryFormSchema).optional(),
  incrementKind: z.enum(['roll', 'count']).optional(),
  incrementRoll: rollFormObjectSchema.optional(),
  incrementCount: z.coerce.number().int().min(1).optional(),
})

export type ProgressionTrackFormItem = z.infer<typeof progressionTrackFormItemSchema>

export const PROGRESSION_BASIS_VALUES = ['character-level', 'spell-slot-level'] as const

export type ProgressionBasisFormValue = (typeof PROGRESSION_BASIS_VALUES)[number]
