import {
  ABILITY_ENTRIES,
  ABILITY_IDS,
  getAbilityCompactLabel,
  getAvailableStandardArrayScores,
  type Ability,
} from '@rpg/contracts'

import type { AbilityScoreSelectUsedBy } from '@/components/ability-score/ability-score-select-score-grid'

export function buildAbilityScoreSelectUsedBy(
  ability: Ability,
  scores: Partial<Record<Ability, number>>,
): Partial<Record<number, AbilityScoreSelectUsedBy>> {
  const usedBy: Partial<Record<number, AbilityScoreSelectUsedBy>> = {}

  for (const otherAbility of ABILITY_IDS) {
    if (otherAbility === ability) continue
    const score = scores[otherAbility]
    if (typeof score !== 'number') continue

    usedBy[score] = {
      fullName: ABILITY_ENTRIES[otherAbility].label,
      compactLabel: getAbilityCompactLabel(otherAbility),
    }
  }

  return usedBy
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
