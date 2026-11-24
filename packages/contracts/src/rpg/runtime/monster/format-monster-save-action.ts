import type { MonsterAction } from '../../content/monster/action/index'
import { DAMAGE_APPLICATION_AMOUNT_PRESENTATION } from '../../content/lib/resolution/damage-application-labels'
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
import {
  getResolutionOutcomeResultStatBlockLead,
  getResolutionRepeatSaveFailureTierStatBlockLead,
} from '../../vocab/resolution'
import { abilityModifier } from '../creature/ability-modifier'
import { abilitySaveDc } from '../creature/spell-dc'
import { resolveStatBlockDamagePart } from '../creature/stat-block-average'
import { formatStatBlockDamageComponent } from './format-stat-block-damage'
import {
  joinStatBlockProseParagraph,
  statBlockOutcomeLead,
  statBlockProseSpacing,
  statBlockSaveLead,
  type StatBlockProse,
  type StatBlockProseSegment,
} from '../prose/stat-block-prose'
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

type DamageEffect = Extract<SaveAction['resolution']['effects'][number], { kind: 'damage' }>

function damagePhrase(effect: DamageEffect, amount: 'full' | 'half'): string {
  const part = resolveStatBlockDamagePart(effect.roll, 0)
  const clause = formatStatBlockDamageComponent({
    average: part.average,
    expression: part.expression,
    damageTypeId: effect.damageType,
  })
  if (amount === 'half') return `half of ${clause}`
  return clause
}

type DamagePrint = { effect: DamageEffect; amount: 'full' | 'half' }

function damagePrintForRow(
  row: NonNullable<SaveOutcome['effects']>[number],
  effectById: Map<string, SaveAction['resolution']['effects'][number]>,
): DamagePrint | undefined {
  if (row.kind !== 'effect-reference') return undefined
  const effect = effectById.get(row.effectId)
  if (!effect || effect.kind !== 'damage') return undefined
  if (row.amount !== 'full' && row.amount !== 'half') return undefined
  return { effect, amount: row.amount }
}

function joinDamagePhrases(prints: readonly DamagePrint[]): string | undefined {
  if (prints.length === 0) return undefined
  return `${prints.map((print) => damagePhrase(print.effect, print.amount)).join(' plus ')}.`
}

function everyDamageIsHalf(
  rows: NonNullable<SaveOutcome['effects']>,
  effectById: Map<string, SaveAction['resolution']['effects'][number]>,
): boolean {
  const prints = rows.flatMap((row) => {
    const print = damagePrintForRow(row, effectById)
    return print ? [print] : []
  })
  return prints.length > 0 && prints.every((print) => print.amount === 'half')
}

function outcomeEffectClauses(
  rows: SaveOutcome['effects'] | undefined,
  effects: SaveAction['resolution']['effects'],
): string[] {
  const effectById = new Map(effects.map((effect) => [effect.id, effect]))
  const list = rows ?? []
  const collapseHalf = everyDamageIsHalf(list, effectById)
  const clauses: string[] = []
  let damageRun: DamagePrint[] = []
  let emittedHalf = false

  const flushDamage = () => {
    const sentence = joinDamagePhrases(damageRun)
    if (sentence) clauses.push(sentence)
    damageRun = []
  }

  for (const row of list) {
    if (row.kind === 'effect-reference') {
      const damage = damagePrintForRow(row, effectById)
      if (!damage) continue
      if (collapseHalf) {
        if (!emittedHalf) {
          clauses.push(`${DAMAGE_APPLICATION_AMOUNT_PRESENTATION.half}.`)
          emittedHalf = true
        }
        continue
      }
      damageRun.push(damage)
      continue
    }
    flushDamage()
    if (row.kind === 'condition' || row.kind === 'note') {
      clauses.push(...formatOrderedOutcomeEffects([row]))
    }
  }
  flushDamage()
  return clauses
}

function outcomeBodyClauses(
  outcome: SaveOutcome,
  effects: SaveAction['resolution']['effects'],
): string[] {
  return outcomeEffectClauses(outcome.effects, effects)
}

function outcomeProse(
  label: string,
  outcome: SaveOutcome,
  effects: SaveAction['resolution']['effects'],
): StatBlockProseSegment[] | undefined {
  const clauses = outcomeBodyClauses(outcome, effects)
  const body = clauses.join(' ')
  if (!body) return undefined
  return statBlockOutcomeLead(label, body)
}

function proseSentence(text: string | undefined): string | undefined {
  const trimmed = text?.trim()
  if (!trimmed) return undefined
  return trimmed.endsWith('.') ? trimmed : `${trimmed}.`
}

function secondFailureProse(
  outcome: SaveOutcome,
  effects: SaveAction['resolution']['effects'],
): StatBlockProseSegment[] | undefined {
  const repeatSave = outcome.repeatSave
  if (!repeatSave) return undefined
  const clauses = [
    ...outcomeEffectClauses(repeatSave.secondFailure.effects, effects),
    ...(proseSentence(repeatSave.secondFailure.note)
      ? [proseSentence(repeatSave.secondFailure.note)!]
      : []),
  ]
  if (clauses.length === 0) return undefined
  return statBlockOutcomeLead(
    getResolutionRepeatSaveFailureTierStatBlockLead('secondFailure'),
    clauses.join(' '),
  )
}

function repeatSaveProseSegments(
  outcome: SaveOutcome,
  effects: SaveAction['resolution']['effects'],
): StatBlockProseSegment[] {
  const repeatSave = outcome.repeatSave
  if (!repeatSave) return []
  const segments: StatBlockProseSegment[] = []
  const pushPlain = (sentence: string) => {
    if (segments.length > 0) segments.push(statBlockProseSpacing())
    segments.push({ kind: 'text', value: sentence })
  }
  pushPlain(formatRepeatSaveTransition(repeatSave.timing))
  const eligibility = proseSentence(repeatSave.eligibilityNote)
  if (eligibility) pushPlain(eligibility)
  if (repeatSave.successOnRepeatEndsEffect) {
    pushPlain('On a success, the target ends the effect on itself.')
  }
  const second = secondFailureProse(outcome, effects)
  if (second) {
    if (segments.length > 0) segments.push(statBlockProseSpacing())
    segments.push(...second)
  }
  return segments
}

function failureOrSuccessProse(
  outcome: SaveOutcome,
  resolution: SaveAction['resolution'],
): StatBlockProseSegment[] {
  const line = formatResolutionOutcomeLine(outcome, resolution)
  const failureOrSuccessLead = getResolutionOutcomeResultStatBlockLead('failed-or-successful-save')
  const prefix = `${failureOrSuccessLead}: `
  const body = line.startsWith(prefix) ? line.slice(prefix.length) : line
  return statBlockOutcomeLead(failureOrSuccessLead, body)
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

function formatMonsterSaveActionProse(args: {
  action: SaveAction
  abilityScores: Record<Ability, number>
  proficiencyBonus: number
  spellcastingAbilityScore?: number
}): StatBlockProse {
  const { action } = args
  const resolution = action.resolution
  const dc = saveDc(args)
  const ability =
    resolution.method.kind === 'saving-throw'
      ? getAbilityLabel(resolution.method.ability)
      : 'Saving throw'
  const failed = resolution.outcomes.find((outcome) => outcome.result === 'failed-save')
  const saved = resolution.outcomes.find((outcome) => outcome.result === 'successful-save')
  const failureOrSuccess = resolution.outcomes.find(
    (outcome) => outcome.result === 'failed-or-successful-save',
  )

  const failureLabel = failed?.repeatSave
    ? getResolutionRepeatSaveFailureTierStatBlockLead('firstFailure')
    : getResolutionOutcomeResultStatBlockLead('failed-save')

  const segments: StatBlockProseSegment[] = [
    ...statBlockSaveLead(ability, dc, selectionPhrase(action)),
  ]

  if (failed) {
    const failedProse = outcomeProse(failureLabel, failed, resolution.effects)
    if (failedProse) {
      segments.push(statBlockProseSpacing(), ...failedProse)
    }
    const repeat = repeatSaveProseSegments(failed, resolution.effects)
    if (repeat.length > 0) {
      segments.push(statBlockProseSpacing(), ...repeat)
    }
  }

  if (saved) {
    const savedProse = outcomeProse(
      getResolutionOutcomeResultStatBlockLead('successful-save'),
      saved,
      resolution.effects,
    )
    if (savedProse) {
      segments.push(statBlockProseSpacing(), ...savedProse)
    }
  }

  if (failureOrSuccess) {
    segments.push(statBlockProseSpacing(), ...failureOrSuccessProse(failureOrSuccess, resolution))
  }

  return segments
}

/** SRD stat-block heading and body for a monster saving-throw action. */
export function formatMonsterSaveAction(args: {
  action: SaveAction
  /** Resolved display name. Limited-use suffix is applied here and nowhere else. */
  name: string
  abilityScores: Record<Ability, number>
  proficiencyBonus: number
  spellcastingAbilityScore?: number
}): { heading: string; body: string; bodyProse: StatBlockProse } {
  const limitedUse = limitedUseSchema.safeParse(args.action.limitedUse).data
  const heading = formatMonsterLimitedUseHeading(args.name, limitedUse)
  const bodyProse = formatMonsterSaveActionProse(args)
  return { heading, body: joinStatBlockProseParagraph(bodyProse), bodyProse }
}
