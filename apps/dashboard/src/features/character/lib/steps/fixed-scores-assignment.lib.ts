import {
  ABILITY_IDS,
  findAbilityAssignedToScore,
  getAvailableStandardArrayScores,
  type Ability,
} from '@rpg/contracts'

import { abilitiesFormCopy, FIXED_SCORES_EMPTY_SCORE_VALUE } from './abilities-form-labels'

export type FixedScoreOption = {
  value: string
  label: string
  disabled: boolean
  assignedTo?: Ability
}

export function formatFixedScoreOptionLabel(score: number, assignedTo?: Ability): string {
  if (!assignedTo) return String(score)
  return abilitiesFormCopy.assignedTo(score, assignedTo.toUpperCase())
}

export function getScoreOptionsForAbility(
  ability: Ability,
  scores: Partial<Record<Ability, number>>,
  scorePool: readonly number[],
): FixedScoreOption[] {
  const emptyOption: FixedScoreOption = {
    value: FIXED_SCORES_EMPTY_SCORE_VALUE,
    label: abilitiesFormCopy.emptyScore,
    disabled: false,
  }

  const scoreOptions = [...scorePool]
    .sort((left, right) => right - left)
    .map((score) => {
      const assignedTo = findAbilityAssignedToScore(scores, score, ability)
      return {
        value: String(score),
        label: formatFixedScoreOptionLabel(score, assignedTo),
        disabled: assignedTo !== undefined,
        assignedTo,
      }
    })

  return [emptyOption, ...scoreOptions]
}

export function getFixedScoresRemainingCount(
  scores: Partial<Record<Ability, number>>,
  scorePool: readonly number[],
): number {
  return getAvailableStandardArrayScores(scores, scorePool).length
}

export function scoresFromFormValues(
  values: Partial<Record<Ability, number | undefined>>,
): Partial<Record<Ability, number>> {
  return Object.fromEntries(
    ABILITY_IDS.map((ability) => {
      const score = values[ability]
      return typeof score === 'number' ? [ability, score] : null
    }).filter((entry): entry is [Ability, number] => entry !== null),
  )
}

export function assignScoreFromPool(
  scores: Partial<Record<Ability, number>>,
  ability: Ability,
  score: number,
): Partial<Record<Ability, number>> {
  return { ...scores, [ability]: score }
}

export function replaceScoreFromPool(
  scores: Partial<Record<Ability, number>>,
  ability: Ability,
  score: number,
): Partial<Record<Ability, number>> {
  return { ...scores, [ability]: score }
}

export function swapAssignedScores(
  scores: Partial<Record<Ability, number>>,
  fromAbility: Ability,
  toAbility: Ability,
): Partial<Record<Ability, number>> {
  if (fromAbility === toAbility) return scores

  const fromScore = scores[fromAbility]
  if (typeof fromScore !== 'number') return scores

  const toScore = scores[toAbility]
  const next = { ...scores, [toAbility]: fromScore }

  if (typeof toScore === 'number') {
    next[fromAbility] = toScore
  } else {
    delete next[fromAbility]
  }

  return next
}

export function moveAssignedScore(
  scores: Partial<Record<Ability, number>>,
  fromAbility: Ability,
  toAbility: Ability,
): Partial<Record<Ability, number>> {
  return swapAssignedScores(scores, fromAbility, toAbility)
}

export function clearAbilityScore(
  scores: Partial<Record<Ability, number>>,
  ability: Ability,
): Partial<Record<Ability, number>> {
  const next = { ...scores }
  delete next[ability]
  return next
}

export function applyScorePatchToFormValues(
  current: Partial<Record<Ability, number | undefined>>,
  patch: Partial<Record<Ability, number>>,
): Partial<Record<Ability, number | undefined>> {
  const next = { ...current, ...patch }
  for (const ability of ABILITY_IDS) {
    if (!(ability in patch)) continue
    if (patch[ability] === undefined) {
      delete next[ability]
    }
  }
  return next
}
