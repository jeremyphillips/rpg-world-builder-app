import type { MonsterAction } from '../../content/monster/action'
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

function outcomeSentence(
  label: 'Failure' | 'Success',
  outcome: SaveAction['resolution']['outcomes'][number],
  effects: SaveAction['resolution']['effects'],
): string {
  const effectById = new Map(effects.map((effect) => [effect.id, effect]))
  const clauses = outcome.applications.flatMap((application) => {
    const effect = effectById.get(application.effectId)
    if (!effect || effect.kind !== 'damage') return []
    if (application.amount !== 'full' && application.amount !== 'half') return []
    return [damageClause(effect, application.amount)]
  })
  const note = outcome.note?.trim()
  const body = [...clauses, ...(note ? [`${note}.`] : [])].join(' ')
  return body ? `${label}: ${body}` : `${label}:`
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
  const sentences = [
    `${ability} Saving Throw: DC ${dc ?? '—'}, ${selectionPhrase(action)}.`,
    ...(failed ? [outcomeSentence('Failure', failed, resolution.effects)] : []),
    ...(saved ? [outcomeSentence('Success', saved, resolution.effects)] : []),
  ]
  return { heading, body: sentences.join(' ') }
}
