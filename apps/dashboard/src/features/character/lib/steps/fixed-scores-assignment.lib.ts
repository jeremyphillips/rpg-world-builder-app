import {
  ABILITY_ENTRIES,
  ABILITY_IDS,
  findAbilityAssignedToScore,
  getAbilityCompactLabel,
  getAvailableStandardArrayScores,
  type Ability,
} from '@rpg/contracts'

import type {
  FixedScoreSelectOption,
  StandardArrayScoreOperation,
} from '@/components/ability-score/fixed-score-select-option.types'

export type { FixedScoreSelectOption, StandardArrayScoreOperation }

export type ResolveStandardArrayScoreResult =
  | { operation: 'current' }
  | { operation: 'invalid' }
  | { operation: 'assign' | 'move' | 'swap'; next: Partial<Record<Ability, number>> }

export type ResolveStandardArrayClearResult =
  | { operation: 'invalid' }
  | { operation: 'clear'; next: Partial<Record<Ability, number>> }

function buildScorePoolMultiset(scorePool: readonly number[]): Map<number, number> {
  const counts = new Map<number, number>()
  for (const score of scorePool) {
    counts.set(score, (counts.get(score) ?? 0) + 1)
  }
  return counts
}

function scoreExistsInPool(score: number, scorePool: readonly number[]): boolean {
  return scorePool.includes(score)
}

/** Multiset check: assigned scores cannot exceed pool multiplicity. */
export function isValidPartialStandardArrayAssignment(
  scores: Partial<Record<Ability, number>>,
  scorePool: readonly number[],
): boolean {
  const counts = buildScorePoolMultiset(scorePool)

  for (const ability of ABILITY_IDS) {
    const score = scores[ability]
    if (typeof score !== 'number') continue

    const remaining = (counts.get(score) ?? 0) - 1
    if (remaining < 0) return false
    counts.set(score, remaining)
  }

  return true
}

function swapAssignedScores(
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

function clearAbilityScore(
  scores: Partial<Record<Ability, number>>,
  ability: Ability,
): Partial<Record<Ability, number>> {
  const next = { ...scores }
  delete next[ability]
  return next
}

function finalizeMutation(
  scores: Partial<Record<Ability, number>>,
  scorePool: readonly number[],
  operation: 'assign' | 'move' | 'swap',
  next: Partial<Record<Ability, number>>,
): ResolveStandardArrayScoreResult {
  if (!isValidPartialStandardArrayAssignment(next, scorePool)) {
    return { operation: 'invalid' }
  }
  return { operation, next }
}

function moveOrSwapOperation(
  scores: Partial<Record<Ability, number>>,
  scorePool: readonly number[],
  fromAbility: Ability,
  targetAbility: Ability,
): ResolveStandardArrayScoreResult {
  const targetEmpty = typeof scores[targetAbility] !== 'number'
  const operation = targetEmpty ? 'move' : 'swap'
  return finalizeMutation(
    scores,
    scorePool,
    operation,
    swapAssignedScores(scores, fromAbility, targetAbility),
  )
}

function resolveFromDragSource(
  scores: Partial<Record<Ability, number>>,
  scorePool: readonly number[],
  targetAbility: Ability,
  score: number,
  fromAbility: Ability,
): ResolveStandardArrayScoreResult {
  if (fromAbility === targetAbility || scores[fromAbility] !== score) {
    return { operation: 'invalid' }
  }
  return moveOrSwapOperation(scores, scorePool, fromAbility, targetAbility)
}

function resolveFromScoreOwner(
  scores: Partial<Record<Ability, number>>,
  scorePool: readonly number[],
  targetAbility: Ability,
  score: number,
  owner: Ability,
): ResolveStandardArrayScoreResult {
  if (scores[owner] !== score) {
    return { operation: 'invalid' }
  }
  return moveOrSwapOperation(scores, scorePool, owner, targetAbility)
}

function resolveFromAvailablePool(
  scores: Partial<Record<Ability, number>>,
  scorePool: readonly number[],
  targetAbility: Ability,
  score: number,
): ResolveStandardArrayScoreResult {
  const available = getAvailableStandardArrayScores(scores, scorePool)
  if (!available.includes(score)) {
    return { operation: 'invalid' }
  }
  return finalizeMutation(scores, scorePool, 'assign', { ...scores, [targetAbility]: score })
}

export function resolveStandardArrayScoreToAbility(
  scores: Partial<Record<Ability, number>>,
  scorePool: readonly number[],
  targetAbility: Ability,
  score: number,
  source?: { fromAbility: Ability },
): ResolveStandardArrayScoreResult {
  if (!isValidPartialStandardArrayAssignment(scores, scorePool)) {
    return { operation: 'invalid' }
  }

  if (!scoreExistsInPool(score, scorePool)) {
    return { operation: 'invalid' }
  }

  if (scores[targetAbility] === score) {
    return { operation: 'current' }
  }

  if (source) {
    return resolveFromDragSource(scores, scorePool, targetAbility, score, source.fromAbility)
  }

  const owner = findAbilityAssignedToScore(scores, score, targetAbility)
  if (owner) {
    return resolveFromScoreOwner(scores, scorePool, targetAbility, score, owner)
  }

  return resolveFromAvailablePool(scores, scorePool, targetAbility, score)
}

export function resolveStandardArrayClearAbility(
  scores: Partial<Record<Ability, number>>,
  scorePool: readonly number[],
  ability: Ability,
): ResolveStandardArrayClearResult {
  if (!isValidPartialStandardArrayAssignment(scores, scorePool)) {
    return { operation: 'invalid' }
  }

  if (typeof scores[ability] !== 'number') {
    return { operation: 'invalid' }
  }

  const next = clearAbilityScore(scores, ability)
  if (!isValidPartialStandardArrayAssignment(next, scorePool)) {
    return { operation: 'invalid' }
  }

  return { operation: 'clear', next }
}

function formatOptionLabels(
  operation: StandardArrayScoreOperation,
  score: number,
  owner: Ability | undefined,
): Pick<FixedScoreSelectOption, 'secondaryLabel' | 'ariaLabel'> {
  if (operation === 'move' && owner) {
    const fullName = ABILITY_ENTRIES[owner].label
    const compact = getAbilityCompactLabel(owner)
    return {
      secondaryLabel: `Move from ${compact}`,
      ariaLabel: `Move from ${fullName}, ${score}`,
    }
  }

  if (operation === 'swap' && owner) {
    const fullName = ABILITY_ENTRIES[owner].label
    const compact = getAbilityCompactLabel(owner)
    return {
      secondaryLabel: `Swap with ${compact}`,
      ariaLabel: `Swap with ${fullName}, ${score}`,
    }
  }

  return { ariaLabel: String(score) }
}

export function buildFixedScoreSelectOptions(
  targetAbility: Ability,
  scores: Partial<Record<Ability, number>>,
  scorePool: readonly number[],
): FixedScoreSelectOption[] {
  const sorted = [...scorePool].sort((left, right) => left - right)

  return sorted.map((score) => {
    const resolution = resolveStandardArrayScoreToAbility(scores, scorePool, targetAbility, score)
    const owner =
      resolution.operation === 'move' || resolution.operation === 'swap'
        ? findAbilityAssignedToScore(scores, score, targetAbility)
        : undefined
    const labels = formatOptionLabels(resolution.operation, score, owner)

    return {
      score,
      operation: resolution.operation,
      ...labels,
    }
  })
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
