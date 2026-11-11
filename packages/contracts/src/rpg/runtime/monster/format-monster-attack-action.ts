import { getEffectConditionLabel } from '../../vocab/effect-condition'
import { formatStatBlockDamageComponent } from './format-stat-block-damage'
import type { ResolvedOnHitEffect } from './resolve-monster-action-attack-profile'

export type FormattableMonsterAttack = {
  attackBonusLabel: string
  damage: string
  damageExpression?: string
  damageTypeId: string
  modes: Array<'melee' | 'ranged'>
  reach?: number
  range?: { normal: number; long?: number }
  onHit?: ResolvedOnHitEffect[]
}

function attackPrefix(modes: readonly ('melee' | 'ranged')[]): string | undefined {
  const labels: string[] = []
  if (modes.includes('melee')) labels.push('Melee')
  if (modes.includes('ranged')) labels.push('Ranged')
  if (labels.length === 0) return undefined
  return `${labels.join(' or ')} Attack Roll`
}

function rangeDistance(range: { normal: number; long?: number }): string {
  const span = range.long != null ? `${range.normal}/${range.long}` : String(range.normal)
  return `range ${span} ft.`
}

function distanceClause(line: FormattableMonsterAttack): string | undefined {
  const parts: string[] = []
  if (line.modes.includes('melee') && line.reach != null) parts.push(`reach ${line.reach} ft.`)
  if (line.modes.includes('ranged') && line.range) parts.push(rangeDistance(line.range))
  if (parts.length === 0) return undefined
  return parts.join(' or ')
}

function conditionClause(effect: Extract<ResolvedOnHitEffect, { kind: 'condition' }>): string {
  const label = getEffectConditionLabel(effect.conditionId)
  const qualification = effect.description ? ` ${effect.description}` : ''
  return `the target has the ${label} condition${qualification}`
}

function hitClause(line: FormattableMonsterAttack): string | undefined {
  const damageParts = [
    ...(line.damageExpression
      ? [
          formatStatBlockDamageComponent({
            average: Number(line.damage),
            expression: line.damageExpression,
            damageTypeId: line.damageTypeId,
          }),
        ]
      : []),
    ...(line.onHit ?? [])
      .filter((effect) => effect.kind === 'damage')
      .map((effect) => formatStatBlockDamageComponent(effect)),
  ]
  const conditions = (line.onHit ?? [])
    .filter((effect) => effect.kind === 'condition')
    .map((effect) => conditionClause(effect))
  const notes = (line.onHit ?? [])
    .filter((effect) => effect.kind === 'note')
    .map((effect) => effect.description)
  const lead = [damageParts.join(' plus '), ...conditions].filter((part) => part.length > 0)
  const body = [...(lead.length > 0 ? [lead.join(', and ')] : []), ...notes]
  if (body.length === 0) return undefined
  return `Hit: ${body.join('. ')}`
}

/** SRD attack sentence from a resolved attack line. Does not resolve the attack. */
export function formatMonsterAttackAction(line: FormattableMonsterAttack): string | undefined {
  const prefix = attackPrefix(line.modes)
  if (!prefix) return undefined
  const distance = distanceClause(line)
  const opening = distance
    ? `${prefix}: ${line.attackBonusLabel}, ${distance}`
    : `${prefix}: ${line.attackBonusLabel}.`
  const hit = hitClause(line)
  return hit ? `${opening} ${hit}.` : opening
}
