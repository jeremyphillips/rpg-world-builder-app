import { z } from 'zod'

import { addCustomRefinementIssue } from '../../../lib/add-custom-refinement-issue'
import { activationTriggerSchema } from '../../primitives/activation-trigger'
import { ACTION_ECONOMY_ENTRIES } from '../action-economy'
import { vocabEnumFromEntries, keysFromEntries } from '../enum-schema'
import type { GameTermEntry, VocabularyTerm } from '../types'
import { spellValidationMessages } from './spell-messages'

// ---------------------------------------------------------------------------
// Casting time units — closed SRD set for spell metadata.
// ---------------------------------------------------------------------------

export const CASTING_TIME_UNIT_TERM = {
  label: 'Casting Time Unit',
  description: 'The time cost to cast a spell.',
  sentence: {
    singular: 'casting time unit',
    plural: 'casting time units',
  },
} as const satisfies VocabularyTerm

export const CASTING_TIME_UNIT_ENTRIES = {
  ...ACTION_ECONOMY_ENTRIES,
  minute: { label: 'Minute', description: 'Casting takes one or more minutes.' },
  hour: { label: 'Hour', description: 'Casting takes one or more hours.' },
} as const satisfies Record<string, GameTermEntry>

export type CastingTimeUnit = keyof typeof CASTING_TIME_UNIT_ENTRIES

export const CASTING_TIME_UNITS = keysFromEntries(CASTING_TIME_UNIT_ENTRIES)

export const castingTimeUnitSchema = vocabEnumFromEntries(CASTING_TIME_UNIT_ENTRIES)

export const spellCastingTimeNormalSchema = z.object({
  value: z.number().int().min(1),
  unit: castingTimeUnitSchema,
  /** Required when `unit` is `reaction`. Forbidden for every other unit. */
  trigger: activationTriggerSchema.optional(),
})

export type SpellCastingTimeNormal = z.infer<typeof spellCastingTimeNormalSchema>

export const spellCastingTimeSchema = z
  .object({
    normal: spellCastingTimeNormalSchema,
    canBeCastAsRitual: z.boolean(),
  })
  .superRefine((castingTime, ctx) => {
    const isReaction = castingTime.normal.unit === 'reaction'
    if (isReaction && !castingTime.normal.trigger) {
      addCustomRefinementIssue(ctx, spellValidationMessages.reactionTriggerRequired(), [
        'normal',
        'trigger',
      ])
    }
    if (!isReaction && castingTime.normal.trigger) {
      addCustomRefinementIssue(ctx, spellValidationMessages.reactionTriggerForbidden(), [
        'normal',
        'trigger',
      ])
    }
  })

export type SpellCastingTime = z.infer<typeof spellCastingTimeSchema>

/** Returns the display label for a casting time unit. Falls back to the raw value. */
export function getCastingTimeUnitLabel(unit: string): string {
  return CASTING_TIME_UNIT_ENTRIES[unit as CastingTimeUnit]?.label ?? unit
}
