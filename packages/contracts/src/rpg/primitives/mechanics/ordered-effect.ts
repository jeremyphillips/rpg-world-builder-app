import { z } from 'zod'

import { overlayOrderedList } from '../../content/lib/system-overlay/overlay-presets'
import { effectConditionSchema } from '../../vocab/effect-condition'
import { effectEndSchema } from './effect-end'
import { damageRollValueSchema } from './effect-value'

const optionalEffectDescriptionSchema = z.string().trim().min(1).optional()

const orderedDamageEffectSchema = damageRollValueSchema.extend({
  kind: z.literal('damage'),
  description: optionalEffectDescriptionSchema,
})

export const orderedConditionEffectSchema = z.object({
  kind: z.literal('condition'),
  conditionId: effectConditionSchema,
  end: effectEndSchema.optional(),
  description: optionalEffectDescriptionSchema,
  replacesConditionId: effectConditionSchema.optional(),
})

export const orderedNoteEffectSchema = z.object({
  kind: z.literal('note'),
  description: z.string().trim().min(1),
})

/**
 * Context-neutral ordered mechanics: damage, conditions, and notes in authored
 * order. Used by attack on-hit, save outcomes, and repeat-save second stages.
 */
export const orderedEffectSchema = z.discriminatedUnion('kind', [
  orderedDamageEffectSchema,
  orderedConditionEffectSchema,
  orderedNoteEffectSchema,
])

export const orderedEffectsSchema = overlayOrderedList(orderedEffectSchema)

/** Condition ids already present on an ordered effect list, in first-seen order. */
export function precedingConditionIdsFromEffects(effects: unknown): string[] {
  if (!Array.isArray(effects)) return []
  const ids = new Set<string>()
  for (const entry of effects) {
    if (
      entry &&
      typeof entry === 'object' &&
      (entry as { kind?: string }).kind === 'condition' &&
      typeof (entry as { conditionId?: string }).conditionId === 'string'
    ) {
      ids.add((entry as { conditionId: string }).conditionId)
    }
  }
  return [...ids]
}

export type OrderedEffect = z.infer<typeof orderedEffectSchema>
export type OrderedDamageEffect = z.infer<typeof orderedDamageEffectSchema>
export type OrderedConditionEffect = z.infer<typeof orderedConditionEffectSchema>
export type OrderedNoteEffect = z.infer<typeof orderedNoteEffectSchema>
