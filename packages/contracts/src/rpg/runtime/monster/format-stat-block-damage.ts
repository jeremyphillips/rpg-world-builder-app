import { formatStatBlockRollExpression } from '../../primitives/mechanics/roll'
import { getDamageTypeLabel } from '../../vocab/damage/vocabulary'

export type StatBlockDamageComponent = {
  average: number
  expression: string
  damageTypeId: string
}

/** Already-resolved damage as stat-block prose. Does not average dice or add modifiers. */
export function formatStatBlockDamageComponent(part: StatBlockDamageComponent): string {
  const type = getDamageTypeLabel(part.damageTypeId)
  const roll = formatStatBlockRollExpression(part.expression)
  if (!roll.includes('d')) return `${part.average} ${type} damage`
  return `${part.average} (${roll}) ${type} damage`
}
