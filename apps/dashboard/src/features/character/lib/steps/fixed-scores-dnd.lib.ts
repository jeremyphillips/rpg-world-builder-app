import type { DragEndEvent } from '@dnd-kit/core'

import type { Ability } from '@rpg/contracts'

import {
  assignScoreFromPool,
  moveAssignedScore,
  replaceScoreFromPool,
  swapAssignedScores,
} from '../../lib/steps/fixed-scores-assignment.lib'

export const FIXED_SCORES_DND_KINDS = {
  pool: 'pool',
  assigned: 'assigned',
  abilityDrop: 'ability-drop',
} as const

export type FixedScoresPoolDragData = {
  kind: typeof FIXED_SCORES_DND_KINDS.pool
  score: number
}

export type FixedScoresAssignedDragData = {
  kind: typeof FIXED_SCORES_DND_KINDS.assigned
  ability: Ability
  score: number
}

export type FixedScoresAbilityDropData = {
  kind: typeof FIXED_SCORES_DND_KINDS.abilityDrop
  ability: Ability
}

export function fixedScoresPoolDndId(score: number): string {
  return `pool:${score}`
}

export function fixedScoresAssignedDndId(ability: Ability): string {
  return `assigned:${ability}`
}

export function fixedScoresAbilityDropDndId(ability: Ability): string {
  return `ability:${ability}`
}

export function parseFixedScoresAbilityDropId(id: string | number): Ability | undefined {
  const value = String(id)
  if (!value.startsWith('ability:')) return undefined
  const ability = value.slice('ability:'.length)
  if (
    ability === 'str' ||
    ability === 'dex' ||
    ability === 'con' ||
    ability === 'int' ||
    ability === 'wis' ||
    ability === 'cha'
  ) {
    return ability
  }
  return undefined
}

export function resolveFixedScoresDragEnd(
  event: DragEndEvent,
  scores: Partial<Record<Ability, number>>,
): Partial<Record<Ability, number>> | null {
  const { active, over } = event
  if (!over) return null

  const targetAbility = parseFixedScoresAbilityDropId(over.id)
  if (!targetAbility) return null

  const activeData = active.data.current as
    | FixedScoresPoolDragData
    | FixedScoresAssignedDragData
    | undefined
  if (!activeData) return null

  if (activeData.kind === FIXED_SCORES_DND_KINDS.pool) {
    const targetScore = scores[targetAbility]
    return typeof targetScore === 'number'
      ? replaceScoreFromPool(scores, targetAbility, activeData.score)
      : assignScoreFromPool(scores, targetAbility, activeData.score)
  }

  if (activeData.kind === FIXED_SCORES_DND_KINDS.assigned) {
    const fromAbility = activeData.ability
    if (fromAbility === targetAbility) return null

    const targetScore = scores[targetAbility]
    return typeof targetScore === 'number'
      ? swapAssignedScores(scores, fromAbility, targetAbility)
      : moveAssignedScore(scores, fromAbility, targetAbility)
  }

  return null
}
