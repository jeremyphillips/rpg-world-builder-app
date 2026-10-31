import type { MonsterAction } from '../../content/monster/action'
import { formatAreaGeometry } from '../../primitives/area-geometry'
import { limitedUseSchema } from '../../primitives/limited-use'
import type { Ability } from '../../vocab/ability'
import { getAbilityLabel } from '../../vocab/ability'
import { getDamageTypeLabel } from '../../vocab/damage/vocabulary'
import { abilityModifier } from '../creature/ability-modifier'
import { abilitySaveDc } from '../creature/spell-dc'
import { resolveStatBlockDamagePart } from '../creature/stat-block-average'
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
  if (source.kind === 'spell') {
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
  return `${part.average} (${part.expression}) ${getDamageTypeLabel(effect.damageType)} damage.`
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
    return `each creature in a ${formatAreaGeometry(resolution.areaOfEffect, 'stat-block')}`
  }
  if (resolution.selectionMode === 'targets' && resolution.target) {
    const proximity = resolution.target.proximity
    const distance =
      proximity.kind === 'distance'
        ? `${proximity.distance.value} feet`
        : proximity.kind === 'reach' && proximity.distance
          ? `${proximity.distance.value} feet`
          : 'reach'
    return `one creature within ${distance}`
  }
  return 'the target'
}

/** SRD stat-block heading and body for a monster saving-throw action. */
export function formatMonsterSaveAction(args: {
  action: SaveAction
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
  const heading = formatMonsterLimitedUseHeading(action.name, limitedUse)
  const failed = resolution.outcomes.find((outcome) => outcome.result === 'failed-save')
  const saved = resolution.outcomes.find((outcome) => outcome.result === 'successful-save')
  const sentences = [
    `${ability} Saving Throw: DC ${dc ?? '—'}, ${selectionPhrase(action)}.`,
    ...(failed ? [outcomeSentence('Failure', failed, resolution.effects)] : []),
    ...(saved ? [outcomeSentence('Success', saved, resolution.effects)] : []),
  ]
  return { heading, body: sentences.join(' ') }
}
