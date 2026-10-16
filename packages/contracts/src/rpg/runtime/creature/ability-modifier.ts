import { NEUTRAL_ABILITY_SCORE } from '../../vocab/ability'

/** Standard D&D ability modifier: ⌊(score − neutral) / 2⌋. */
export function abilityModifier(score: number): number {
  return Math.floor((score - NEUTRAL_ABILITY_SCORE) / 2)
}
