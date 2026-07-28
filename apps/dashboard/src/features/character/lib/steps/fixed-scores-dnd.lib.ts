import type { CollisionDetection, DragEndEvent } from '@dnd-kit/core'
import { pointerWithin } from '@dnd-kit/core'

import type { Ability } from '@rpg/contracts'

import {
  assignScoreFromPool,
  clearAbilityScore,
  replaceScoreFromPool,
  swapAssignedScores,
} from './fixed-scores-assignment.lib'

export const FIXED_SCORES_DND_KINDS = {
  pool: 'pool',
  assigned: 'assigned',
  abilityDrop: 'ability-drop',
  poolContainer: 'pool-container',
} as const

export const FIXED_SCORES_POOL_CONTAINER_DND_ID = 'pool:container' as const

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

export function fixedScoresPoolContainerDndId(): string {
  return FIXED_SCORES_POOL_CONTAINER_DND_ID
}

export function isFixedScoresPoolContainerDrop(id: string | number): boolean {
  return String(id) === FIXED_SCORES_POOL_CONTAINER_DND_ID
}

function parseFixedScoresAbilityId(value: string): Ability | undefined {
  if (
    value === 'str' ||
    value === 'dex' ||
    value === 'con' ||
    value === 'int' ||
    value === 'wis' ||
    value === 'cha'
  ) {
    return value
  }
  return undefined
}

export function parseFixedScoresAbilityDropId(id: string | number): Ability | undefined {
  const value = String(id)
  if (!value.startsWith('ability:')) return undefined
  return parseFixedScoresAbilityId(value.slice('ability:'.length))
}

export function parseFixedScoresAssignedDndId(id: string | number): Ability | undefined {
  const value = String(id)
  if (!value.startsWith('assigned:')) return undefined
  return parseFixedScoresAbilityId(value.slice('assigned:'.length))
}

/** Resolves a drop target from either an ability card zone or an assigned score token. */
export function parseFixedScoresDropTarget(id: string | number): Ability | undefined {
  return parseFixedScoresAbilityDropId(id) ?? parseFixedScoresAssignedDndId(id)
}

/** Prefer ability-card drop zones, then foreign assigned tokens, for reliable empty-card drops. */
export const fixedScoresCollisionDetection: CollisionDetection = (args) => {
  const collisions = pointerWithin(args)
  if (collisions.length === 0) return collisions

  const abilityCollision = collisions.find((collision) =>
    String(collision.id).startsWith('ability:'),
  )
  if (abilityCollision) return [abilityCollision]

  const assignedCollision = collisions.find((collision) => {
    const id = String(collision.id)
    return id.startsWith('assigned:') && id !== String(args.active.id)
  })
  if (assignedCollision) return [assignedCollision]

  const poolContainerCollision = collisions.find((collision) =>
    isFixedScoresPoolContainerDrop(collision.id),
  )
  if (poolContainerCollision) return [poolContainerCollision]

  return collisions
}

export function resolveFixedScoresDragEnd(
  event: DragEndEvent,
  scores: Partial<Record<Ability, number>>,
): Partial<Record<Ability, number>> | null {
  const { active, over } = event
  if (!over) return null

  const activeData = active.data.current as
    | FixedScoresPoolDragData
    | FixedScoresAssignedDragData
    | undefined
  if (!activeData) return null

  if (isFixedScoresPoolContainerDrop(over.id)) {
    if (activeData.kind === FIXED_SCORES_DND_KINDS.assigned) {
      return clearAbilityScore(scores, activeData.ability)
    }
    return null
  }

  const targetAbility = parseFixedScoresDropTarget(over.id)
  if (!targetAbility) return null

  if (activeData.kind === FIXED_SCORES_DND_KINDS.pool) {
    const targetScore = scores[targetAbility]
    return typeof targetScore === 'number'
      ? replaceScoreFromPool(scores, targetAbility, activeData.score)
      : assignScoreFromPool(scores, targetAbility, activeData.score)
  }

  if (activeData.kind === FIXED_SCORES_DND_KINDS.assigned) {
    const fromAbility = activeData.ability
    if (fromAbility === targetAbility) return null

    return swapAssignedScores(scores, fromAbility, targetAbility)
  }

  return null
}
