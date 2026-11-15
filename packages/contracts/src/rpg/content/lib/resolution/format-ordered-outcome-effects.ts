import {
  formatEffectEnd,
  type EffectEndFormatContext,
} from '../../../primitives/mechanics/effect-end'
import type {
  OrderedConditionEffect,
  OrderedEffect,
} from '../../../primitives/mechanics/ordered-effect'
import { formatStatBlockRollExpression } from '../../../primitives/mechanics/roll'
import { resolveStatBlockDamagePart } from '../../../runtime/creature/stat-block-average'
import { getDamageTypeLabel } from '../../../vocab/damage/vocabulary'
import { getEffectConditionLabel } from '../../../vocab/effect-condition'
import type { RepeatSaveTiming } from './repeat-save'

const STAT_BLOCK_EFFECT_END_CONTEXT: EffectEndFormatContext = {
  voice: 'monster-stat-block',
}

/** SRD phrasing when a later condition replaces an earlier staged condition. */
export function formatConditionReplacementSentence(args: {
  conditionId: string
  replacesConditionId: string
}): string {
  const next = getEffectConditionLabel(args.conditionId)
  const previous = getEffectConditionLabel(args.replacesConditionId)
  return `The target has the ${next} condition instead of the ${previous} condition.`
}

function formatOrderedDamageClause(effect: Extract<OrderedEffect, { kind: 'damage' }>): string {
  const part = resolveStatBlockDamagePart(effect.roll, 0)
  const type = getDamageTypeLabel(effect.damageType)
  const roll = formatStatBlockRollExpression(part.expression)
  const damage = roll.includes('d')
    ? `${part.average} (${roll}) ${type} damage`
    : `${part.average} ${type} damage`
  const qualification = effect.description ? ` ${effect.description}` : ''
  return `The target takes ${damage}${qualification}.`
}

function formatOrderedConditionClause(effect: OrderedConditionEffect): string {
  if (effect.replacesConditionId) {
    return formatConditionReplacementSentence({
      conditionId: effect.conditionId,
      replacesConditionId: effect.replacesConditionId,
    })
  }
  const label = getEffectConditionLabel(effect.conditionId)
  const timing = effect.end ? ` ${formatEffectEnd(effect.end, STAT_BLOCK_EFFECT_END_CONTEXT)}` : ''
  const qualification = effect.description ? ` ${effect.description}` : ''
  return `The target has the ${label} condition${timing}${qualification}.`
}

function formatOrderedNoteClause(effect: Extract<OrderedEffect, { kind: 'note' }>): string {
  const text = effect.description.trim()
  return text.endsWith('.') ? text : `${text}.`
}

/** Ordered outcome effect rows as stat-block sentences (damage, condition, note). */
export function formatOrderedOutcomeEffects(
  effects: readonly OrderedEffect[] | undefined,
): string[] {
  if (!effects || effects.length === 0) return []
  return effects.map((effect) => {
    switch (effect.kind) {
      case 'damage':
        return formatOrderedDamageClause(effect)
      case 'condition':
        return formatOrderedConditionClause(effect)
      case 'note':
        return formatOrderedNoteClause(effect)
      default: {
        const _exhaustive: never = effect
        return _exhaustive
      }
    }
  })
}

/** Transition between first and second failure when a repeat save is authored. */
export function formatRepeatSaveTransition(timing: RepeatSaveTiming): string {
  const boundary = timing.boundary === 'start' ? 'start' : 'end'
  const turnPhrase = timing.which === 'next' ? 'next turn' : 'turn'
  const subject = timing.participant === 'target' ? 'it' : 'the creature'
  return `At the ${boundary} of its ${turnPhrase}, ${subject} repeats the saving throw.`
}
