import { z } from 'zod'

import { formatLimitedUseNotation } from '../../primitives/limited-use'
import { restLimitedUseSchema, type RestLimitedUse } from '../../primitives/limited-use'
import { getAbilityLabel, abilitySchema } from '../../vocab/ability'
import {
  CREATURE_ROLL_ADJUSTMENT_MODE_ENTRIES,
  creatureEffectCircumstanceSchema,
  creatureRollAdjustmentModeSchema,
  type CreatureEffectCircumstance,
  type CreatureRollAdjustmentMode,
} from '../../vocab/creature-effect'
import { getEffectConditionLabel } from '../../vocab/effect-condition'
import { getSkillName, skillSchema } from '../skill-proficiency'
import { joinNaturalList } from '../../primitives/prose'

// ---------------------------------------------------------------------------
// Creature effect payloads. Grant rows wrap these shapes; named traits compose
// them. Evaluation against a live roll is deferred until a roll consumer exists.
// ---------------------------------------------------------------------------

export const creatureRollTargetSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('attack') }),
  z.object({ kind: z.literal('saving-throw') }),
  z.object({
    kind: z.literal('ability-check'),
    ability: abilitySchema,
    skillId: skillSchema.optional(),
  }),
])

export type CreatureRollTarget = z.infer<typeof creatureRollTargetSchema>

export const creatureRollAdjustmentSchema = z.object({
  mode: creatureRollAdjustmentModeSchema,
  rolls: z.array(creatureRollTargetSchema).min(1),
  circumstance: creatureEffectCircumstanceSchema.optional(),
})

export type CreatureRollAdjustment = z.infer<typeof creatureRollAdjustmentSchema>

export const creatureSaveOutcomeOverrideSchema = z.object({
  outcome: z.literal('success'),
  limitedUse: restLimitedUseSchema,
})

export type CreatureSaveOutcomeOverride = z.infer<typeof creatureSaveOutcomeOverrideSchema>

export function formatCreatureRollTarget(target: CreatureRollTarget): string {
  if (target.kind === 'attack') return 'attack rolls'
  if (target.kind === 'saving-throw') return 'saving throws'
  const ability = getAbilityLabel(target.ability)
  if (target.skillId) return `${ability} (${getSkillName(target.skillId)}) checks`
  return `${ability} checks`
}

function circumstanceClause(circumstance: CreatureEffectCircumstance | undefined): string {
  if (!circumstance) return ''
  switch (circumstance.kind) {
    case 'vs-magic':
      return ' against spells and other magical effects'
    case 'vs-condition':
      return ` to avoid or end the ${getEffectConditionLabel(circumstance.conditionId)} condition`
    case 'ally-adjacent-to-target':
      return ' against a creature if at least one of this creature’s allies is within 5 feet of the creature and the ally doesn’t have the Incapacitated condition'
    case 'in-sunlight':
      return ' while in sunlight'
    default: {
      const _exhaustive: never = circumstance
      return _exhaustive
    }
  }
}

export function formatCreatureRollAdjustmentSentence(adjustment: CreatureRollAdjustment): string {
  const mode = CREATURE_ROLL_ADJUSTMENT_MODE_ENTRIES[adjustment.mode].label
  const rolls = joinNaturalList(adjustment.rolls.map(formatCreatureRollTarget))
  return `${mode} on ${rolls}${circumstanceClause(adjustment.circumstance)}.`
}

export function formatCreatureRollAdjustmentModeLabel(mode: CreatureRollAdjustmentMode): string {
  return CREATURE_ROLL_ADJUSTMENT_MODE_ENTRIES[mode].label
}

/** Stat-block use notation, such as `3/Day`. */
export function formatCreatureSaveOutcomeOverrideNotation(limitedUse: RestLimitedUse): string {
  return formatLimitedUseNotation(limitedUse, 'stat-block')
}

export function formatCreatureSaveOutcomeOverrideSentence(
  override: CreatureSaveOutcomeOverride,
): string {
  const notation = formatCreatureSaveOutcomeOverrideNotation(override.limitedUse)
  return `If this creature fails a saving throw, it can choose to succeed instead (${notation}).`
}
