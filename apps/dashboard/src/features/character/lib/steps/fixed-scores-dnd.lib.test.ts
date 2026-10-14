import { describe, expect, it } from 'vitest'
import type { DragEndEvent } from '@dnd-kit/core'

import { DEFAULT_STANDARD_ARRAY } from '@rpg/contracts'

import { resolveStandardArrayScoreToAbility } from './fixed-scores-assignment.lib'
import {
  fixedScoresAbilityDropDndId,
  fixedScoresAssignedDndId,
  fixedScoresPoolContainerDndId,
  fixedScoresPoolDndId,
  isFixedScoresPoolContainerDrop,
  parseFixedScoresAbilityDropId,
  parseFixedScoresAssignedDndId,
  parseFixedScoresDropTarget,
  resolveFixedScoresDragEnd,
} from './fixed-scores-dnd.lib'

const POOL = DEFAULT_STANDARD_ARRAY

function dragEnd(
  activeId: string,
  activeData: object,
  overId: string | null,
  scores: Partial<Record<string, number>> = { str: 15, dex: 14 },
) {
  return resolveFixedScoresDragEnd(
    {
      active: { id: activeId, data: { current: activeData } },
      over: overId ? { id: overId, data: { current: {} } } : null,
    } as unknown as DragEndEvent,
    scores,
    POOL,
  )
}

describe('fixed-scores-dnd.lib', () => {
  it('builds stable dnd ids', () => {
    expect(fixedScoresPoolDndId(15)).toBe('pool:15')
    expect(fixedScoresPoolContainerDndId()).toBe('pool:container')
    expect(isFixedScoresPoolContainerDrop('pool:container')).toBe(true)
    expect(fixedScoresAssignedDndId('str')).toBe('assigned:str')
    expect(fixedScoresAbilityDropDndId('dex')).toBe('ability:dex')
    expect(parseFixedScoresAbilityDropId('ability:con')).toBe('con')
    expect(parseFixedScoresAssignedDndId('assigned:con')).toBe('con')
    expect(parseFixedScoresDropTarget('assigned:dex')).toBe('dex')
    expect(parseFixedScoresDropTarget('pool:15')).toBeUndefined()
  })

  it('assigns from pool to empty ability', () => {
    const initial = { str: 15 }
    const next = dragEnd(
      fixedScoresPoolDndId(13),
      { kind: 'pool', score: 13 },
      fixedScoresAbilityDropDndId('con'),
      initial,
    )
    expect(next).toEqual({ str: 15, con: 13 })
    expect(resolveStandardArrayScoreToAbility(initial, POOL, 'con', 13)).toMatchObject({ next })
  })

  it('replaces from pool on filled ability', () => {
    const initial = { str: 15, dex: 14 }
    const next = dragEnd(
      fixedScoresPoolDndId(12),
      { kind: 'pool', score: 12 },
      fixedScoresAbilityDropDndId('str'),
      initial,
    )
    expect(next).toEqual({ str: 12, dex: 14 })
    expect(resolveStandardArrayScoreToAbility(initial, POOL, 'str', 12)).toMatchObject({ next })
  })

  it('moves assigned score to empty ability', () => {
    const initial = { str: 15, dex: 14 }
    const next = dragEnd(
      fixedScoresAssignedDndId('str'),
      { kind: 'assigned', ability: 'str', score: 15 },
      fixedScoresAbilityDropDndId('con'),
      initial,
    )
    expect(next).toEqual({ dex: 14, con: 15 })
  })

  it('swaps assigned scores between filled abilities', () => {
    const initial = { str: 15, dex: 14 }
    const next = dragEnd(
      fixedScoresAssignedDndId('str'),
      { kind: 'assigned', ability: 'str', score: 15 },
      fixedScoresAbilityDropDndId('dex'),
      initial,
    )
    expect(next).toEqual({ str: 14, dex: 15 })
  })

  it('swaps assigned score onto another ability token', () => {
    expect(
      dragEnd(
        fixedScoresAssignedDndId('str'),
        { kind: 'assigned', ability: 'str', score: 15 },
        fixedScoresAssignedDndId('dex'),
      ),
    ).toEqual({ str: 14, dex: 15 })
  })

  it('returns an assigned score to the pool when dropped on the pool container', () => {
    expect(
      dragEnd(
        fixedScoresAssignedDndId('str'),
        { kind: 'assigned', ability: 'str', score: 15 },
        fixedScoresPoolContainerDndId(),
      ),
    ).toEqual({ dex: 14 })
  })

  it('no-ops when a pool token is dropped on the pool container', () => {
    expect(
      resolveFixedScoresDragEnd(
        {
          active: {
            id: fixedScoresPoolDndId(12),
            data: { current: { kind: 'pool', score: 12 } },
          },
          over: { id: fixedScoresPoolContainerDndId(), data: { current: {} } },
        } as unknown as DragEndEvent,
        { str: 15 },
        POOL,
      ),
    ).toBeNull()
  })

  it('no-ops for same ability, outside target, or missing over', () => {
    expect(
      dragEnd(
        fixedScoresAssignedDndId('str'),
        { kind: 'assigned', ability: 'str', score: 15 },
        fixedScoresAbilityDropDndId('str'),
      ),
    ).toBeNull()

    expect(
      resolveFixedScoresDragEnd(
        {
          active: {
            id: fixedScoresPoolDndId(12),
            data: { current: { kind: 'pool', score: 12 } },
          },
          over: null,
        } as unknown as DragEndEvent,
        {},
        POOL,
      ),
    ).toBeNull()
  })
})
