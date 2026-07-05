import {
  ABILITY_IDS,
  findAbilityAssignedToScore,
  getAvailableStandardArrayScores,
  type Ability,
} from '@rpg/contracts'

import { abilitiesFormCopy, STANDARD_ARRAY_EMPTY_SCORE_VALUE } from './abilities-form-labels'

export type StandardArrayScoreOption = {
  value: string
  label: string
  disabled: boolean
  assignedTo?: Ability
}

export function formatStandardArrayOptionLabel(score: number, assignedTo?: Ability): string {
  if (!assignedTo) return String(score)
  return abilitiesFormCopy.assignedTo(score, assignedTo.toUpperCase())
}

export function getStandardArrayScoreOptionsForAbility(
  ability: Ability,
  scores: Partial<Record<Ability, number>>,
  standardArray: readonly number[],
): StandardArrayScoreOption[] {
  const emptyOption: StandardArrayScoreOption = {
    value: STANDARD_ARRAY_EMPTY_SCORE_VALUE,
    label: abilitiesFormCopy.emptyScore,
    disabled: false,
  }

  const scoreOptions = [...standardArray]
    .sort((left, right) => right - left)
    .map((score) => {
      const assignedTo = findAbilityAssignedToScore(scores, score, ability)
      return {
        value: String(score),
        label: formatStandardArrayOptionLabel(score, assignedTo),
        disabled: assignedTo !== undefined,
        assignedTo,
      }
    })

  return [emptyOption, ...scoreOptions]
}

export function getStandardArrayRemainingCount(
  scores: Partial<Record<Ability, number>>,
  standardArray: readonly number[],
): number {
  return getAvailableStandardArrayScores(scores, standardArray).length
}

export function listAssignedAbilities(scores: Partial<Record<Ability, number>>): Ability[] {
  return ABILITY_IDS.filter((ability) => typeof scores[ability] === 'number')
}
