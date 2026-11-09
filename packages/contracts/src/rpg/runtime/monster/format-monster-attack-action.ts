import type { DerivedMonsterAttackLine } from './stat-block'
import { formatStatBlockDamageComponent } from './format-stat-block-damage'

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

function distanceClause(line: DerivedMonsterAttackLine): string | undefined {
  const parts: string[] = []
  if (line.modes.includes('melee') && line.reach != null) parts.push(`reach ${line.reach} ft.`)
  if (line.modes.includes('ranged') && line.range) parts.push(rangeDistance(line.range))
  if (parts.length === 0) return undefined
  return parts.join(' or ')
}

function hitClause(line: DerivedMonsterAttackLine): string | undefined {
  const parts = [
    ...(line.damageExpression
      ? [
          formatStatBlockDamageComponent({
            average: Number(line.damage),
            expression: line.damageExpression,
            damageTypeId: line.damageTypeId,
          }),
        ]
      : []),
    ...(line.additionalDamage ?? []).map((part) => formatStatBlockDamageComponent(part)),
  ]
  if (parts.length === 0) return undefined
  return `Hit: ${parts.join(' plus ')}`
}

/** SRD attack sentence from a derived line. Does not resolve the attack. */
export function formatMonsterAttackAction(line: DerivedMonsterAttackLine): string | undefined {
  const prefix = attackPrefix(line.modes)
  if (!prefix) return undefined
  const distance = distanceClause(line)
  const opening = distance
    ? `${prefix}: ${line.attackBonusLabel}, ${distance}`
    : `${prefix}: ${line.attackBonusLabel}.`
  const hit = hitClause(line)
  return hit ? `${opening} ${hit}.` : opening
}
