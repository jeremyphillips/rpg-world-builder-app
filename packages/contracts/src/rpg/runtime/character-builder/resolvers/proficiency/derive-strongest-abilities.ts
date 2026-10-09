import { abilityModifier } from '../../../character/derive'
import { ABILITY_IDS, type Ability } from '../../../../vocab/ability'

/**
 * Abilities tied for the highest modifier, when that modifier is greater than 0.
 * Unset scores are skipped. This raises skills likely to have the character's
 * strongest baseline checks. It does not say those are the skills to choose.
 */
export function deriveStrongestAbilities(
  scores: Partial<Record<Ability, number>> | undefined,
): ReadonlySet<Ability> {
  if (!scores) return new Set()

  let highestModifier = Number.NEGATIVE_INFINITY
  const tied: Ability[] = []

  for (const ability of ABILITY_IDS) {
    const score = scores[ability]
    if (score == null) continue
    const modifier = abilityModifier(score)
    if (modifier > highestModifier) {
      highestModifier = modifier
      tied.length = 0
      tied.push(ability)
    } else if (modifier === highestModifier) {
      tied.push(ability)
    }
  }

  if (tied.length === 0 || highestModifier <= 0) return new Set()
  return new Set(tied)
}
