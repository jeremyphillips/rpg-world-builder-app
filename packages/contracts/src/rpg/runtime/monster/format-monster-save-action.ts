import type { MonsterAction } from '../../content/monster/action/index'
import { formatResolutionOutcomeLine } from '../../content/lib/resolution/format-outcomes'
import {
  formatOrderedOutcomeEffects,
  formatRepeatSaveTransition,
} from '../../content/lib/resolution/format-ordered-outcome-effects'
import { formatResolutionTargetFromParts } from '../../content/lib/resolution/format-target'
import { formatAreaOccupantCreaturePhrase } from '../../content/lib/resolution/format-target-composition'
import { formatAreaGeometry } from '../../primitives/area-geometry'
import { limitedUseSchema } from '../../primitives/limited-use'
import type { Ability } from '../../vocab/ability'
import { getAbilityLabel } from '../../vocab/ability'
import { abilityModifier } from '../creature/ability-modifier'
import { abilitySaveDc } from '../creature/spell-dc'
import { resolveStatBlockDamagePart } from '../creature/stat-block-average'
import { formatStatBlockDamageComponent } from './format-stat-block-damage'
import { formatMonsterLimitedUseHeading } from './spell-entry-presentation'

type SaveAction = Extract<MonsterAction, { kind: 'save' }>
type SaveOutcome = SaveAction['resolution']['outcomes'][number]

function saveDc(args: {
  action: SaveAction
  abilityScores: Record<Ability, number>
  proficiencyBonus: number
  spellcastingAbilityScore?: number
}): number | undefined {
  const source = args.action.dcSource
  if (!source) return undefined
  if (source.kind === 'spellcasting') {
    if (args.spellcastingAbilityScore === undefined) return undefined
    return abilitySaveDc(args.spellcastingAbilityScore, args.proficiencyBonus)
  }
  const score = args.abilityScores[source.ability]
  if (score === undefined) return undefined
  if (!source.proficient) return 8 + abilityModifier(score)
  return abilitySaveDc(score, args.proficiencyBonus)
}

function damageClause(
  effect: Extract<SaveAction['resolution']['effects'][number], { kind: 'damage' }>,
  amount: 'full' | 'half',
): string {
  if (amount === 'half') return 'Half damage.'
  const part = resolveStatBlockDamagePart(effect.roll, 0)
  return `${formatStatBlockDamageComponent({
    average: part.average,
    expression: part.expression,
    damageTypeId: effect.damageType,
  })}.`
}

function outcomeEffectClauses(
  rows: SaveOutcome['effects'] | undefined,
  effects: SaveAction['resolution']['effects'],
): string[] {
  const effectById = new Map(effects.map((effect) => [effect.id, effect]))
  return (rows ?? []).flatMap((row) => {
    if (row.kind === 'effect-reference') {
      const effect = effectById.get(row.effectId)
      if (!effect || effect.kind !== 'damage') return []
      if (row.amount !== 'full' && row.amount !== 'half') return []
      return [damageClause(effect, row.amount)]
    }
    if (row.kind === 'condition' || row.kind === 'note') {
      return formatOrderedOutcomeEffects([row])
    }
    return []
  })
}

function outcomeBodyClauses(
  outcome: SaveOutcome,
  effects: SaveAction['resolution']['effects'],
): string[] {
  return outcomeEffectClauses(outcome.effects, effects)
}

function outcomeSentence(
  label: string,
  outcome: SaveOutcome,
  effects: SaveAction['resolution']['effects'],
): string {
  const clauses = outcomeBodyClauses(outcome, effects)
  const body = clauses.join(' ')
  return body ? `${label}: ${body}` : `${label}:`
}

function proseSentence(text: string | undefined): string | undefined {
  const trimmed = text?.trim()
  if (!trimmed) return undefined
  return trimmed.endsWith('.') ? trimmed : `${trimmed}.`
}

function secondFailureSentence(
  outcome: SaveOutcome,
  effects: SaveAction['resolution']['effects'],
): string | undefined {
  const repeatSave = outcome.repeatSave
  if (!repeatSave) return undefined
  const clauses = [
    ...outcomeEffectClauses(repeatSave.secondFailure.effects, effects),
    ...(proseSentence(repeatSave.secondFailure.note)
      ? [proseSentence(repeatSave.secondFailure.note)!]
      : []),
  ]
  if (clauses.length === 0) return undefined
  return `Second Failure: ${clauses.join(' ')}`
}

function repeatSaveSentences(
  outcome: SaveOutcome,
  effects: SaveAction['resolution']['effects'],
): string[] {
  const repeatSave = outcome.repeatSave
  if (!repeatSave) return []
  const second = secondFailureSentence(outcome, effects)
  return [
    formatRepeatSaveTransition(repeatSave.timing),
    ...(proseSentence(repeatSave.eligibilityNote)
      ? [proseSentence(repeatSave.eligibilityNote)!]
      : []),
    ...(repeatSave.successOnRepeatEndsEffect
      ? ['On a success, the target ends the effect on itself.']
      : []),
    ...(second ? [second] : []),
  ]
}

function selectionPhrase(action: SaveAction): string {
  const resolution = action.resolution
  if (resolution.selectionMode === 'self' && resolution.areaOfEffect) {
    const occupant = formatAreaOccupantCreaturePhrase(resolution.occupantRequirements)
    return `each ${occupant} in a ${formatAreaGeometry(resolution.areaOfEffect, 'stat-block')}`
  }
  if (resolution.selectionMode === 'targets' && resolution.target) {
    const sentence = formatResolutionTargetFromParts(resolution.target)
    if (!sentence) return 'the target'
    return sentence.charAt(0).toLowerCase() + sentence.slice(1)
  }
  return 'the target'
}

/** SRD stat-block heading and body for a monster saving-throw action. */
export function formatMonsterSaveAction(args: {
  action: SaveAction
  /** Resolved display name. Limited-use suffix is applied here and nowhere else. */
  name: string
  abilityScores: Record<Ability, number>
  proficiencyBonus: number
  spellcastingAbilityScore?: number
}): { heading: string; body: string } {
  const { action } = args
  const resolution = action.resolution
  const dc = saveDc(args)
  const ability =
    resolution.method.kind === 'saving-throw'
      ? getAbilityLabel(resolution.method.ability)
      : 'Saving throw'
  const limitedUse = limitedUseSchema.safeParse(action.limitedUse).data
  const heading = formatMonsterLimitedUseHeading(args.name, limitedUse)
  const failed = resolution.outcomes.find((outcome) => outcome.result === 'failed-save')
  const saved = resolution.outcomes.find((outcome) => outcome.result === 'successful-save')
  const failureOrSuccess = resolution.outcomes.find(
    (outcome) => outcome.result === 'failed-or-successful-save',
  )

  const failureLabel = failed?.repeatSave ? 'First Failure' : 'Failure'

  const sentences = [
    `${ability} Saving Throw: DC ${dc ?? '—'}, ${selectionPhrase(action)}.`,
    ...(failed ? [outcomeSentence(failureLabel, failed, resolution.effects)] : []),
    ...(failed ? repeatSaveSentences(failed, resolution.effects) : []),
    ...(saved ? [outcomeSentence('Success', saved, resolution.effects)] : []),
    ...(failureOrSuccess ? [formatResolutionOutcomeLine(failureOrSuccess, resolution)] : []),
  ]
  return { heading, body: sentences.join(' ') }
}
