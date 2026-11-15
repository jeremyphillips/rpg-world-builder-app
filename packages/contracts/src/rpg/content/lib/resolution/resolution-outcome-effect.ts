import { z } from 'zod'

import {
  orderedConditionEffectSchema,
  orderedNoteEffectSchema,
} from '../../../primitives/mechanics/ordered-effect'
import { RESOLUTION_APPLICATION_AMOUNTS } from '../../../vocab/resolution'
import { resolutionEffectIdSchema } from './resolution-effect-id'

/** Points at one library entry. Amount is full or half; half is damage-only. */
export const resolutionEffectReferenceSchema = z.object({
  kind: z.literal('effect-reference'),
  effectId: resolutionEffectIdSchema,
  amount: z.enum(RESOLUTION_APPLICATION_AMOUNTS),
})

export type ResolutionEffectReference = z.infer<typeof resolutionEffectReferenceSchema>

/**
 * Print order for a resolution outcome or repeat-save second failure.
 * Damage, healing, and temporary hit points stay on the envelope library.
 */
export const resolutionOutcomeEffectSchema = z.discriminatedUnion('kind', [
  resolutionEffectReferenceSchema,
  orderedConditionEffectSchema,
  orderedNoteEffectSchema,
])

export type ResolutionOutcomeEffect = z.infer<typeof resolutionOutcomeEffectSchema>
