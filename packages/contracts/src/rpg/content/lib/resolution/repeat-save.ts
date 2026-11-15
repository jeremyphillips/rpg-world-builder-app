import { z } from 'zod'

import {
  EFFECT_END_BOUNDARIES,
  EFFECT_END_PARTICIPANTS,
  EFFECT_END_WHICH,
} from '../../../primitives/mechanics/effect-end'
import { orderedEffectSchema } from '../../../primitives/mechanics/ordered-effect'

export const repeatSaveTimingSchema = z.object({
  participant: z.enum(EFFECT_END_PARTICIPANTS),
  boundary: z.enum(EFFECT_END_BOUNDARIES),
  which: z.enum(EFFECT_END_WHICH),
})

export type RepeatSaveTiming = z.infer<typeof repeatSaveTimingSchema>

export const repeatSaveSecondFailureSchema = z.object({
  effects: z.array(orderedEffectSchema).optional(),
  note: z.string().trim().optional(),
})

export type RepeatSaveSecondFailure = z.infer<typeof repeatSaveSecondFailureSchema>

export const repeatSaveSchema = z.object({
  timing: repeatSaveTimingSchema,
  successOnRepeatEndsEffect: z.boolean().default(true),
  eligibilityNote: z.string().trim().optional(),
  secondFailure: repeatSaveSecondFailureSchema,
})

export type RepeatSave = z.infer<typeof repeatSaveSchema>

export function hasMeaningfulRepeatSaveSecondFailure(
  secondFailure: RepeatSaveSecondFailure | undefined,
): boolean {
  if (!secondFailure) return false
  if (Boolean(secondFailure.note?.trim())) return true
  return Boolean(secondFailure.effects && secondFailure.effects.length > 0)
}

export function hasMeaningfulRepeatSave(repeatSave: RepeatSave | undefined): boolean {
  if (!repeatSave) return false
  if (hasMeaningfulRepeatSaveSecondFailure(repeatSave.secondFailure)) return true
  if (Boolean(repeatSave.eligibilityNote?.trim())) return true
  return Boolean(repeatSave.timing)
}
