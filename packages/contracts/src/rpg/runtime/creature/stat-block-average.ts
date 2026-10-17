import { averageDiceRoll, type DieFace } from '../../primitives/dice'
import { averageRollValue, type RollValue } from '../../primitives/mechanics/roll'

/** Floors a stat-block average after exact dice math — shared by HP and damage lines. */
export function floorStatBlockAverage(value: number): number {
  return Math.floor(value)
}

/** Average HP for hit-dice style stat blocks: floor(average die + count × CON mod), min 1. */
export function averageStatBlockHitPoints(args: {
  hitDieFaces: number
  hitDiceCount: number
  conModifier: number
}): number {
  const averageDie = averageDiceRoll({
    count: args.hitDiceCount,
    faces: args.hitDieFaces as DieFace,
  })
  const total = averageDie + args.hitDiceCount * args.conModifier
  return Math.max(1, floorStatBlockAverage(total))
}

/** Average damage display value: floor(average roll + ability modifier). */
export function averageStatBlockDamage(damage: RollValue, abilityModifierValue: number): number {
  return floorStatBlockAverage(averageRollValue(damage) + abilityModifierValue)
}
