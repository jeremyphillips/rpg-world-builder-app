import { describe, expect, it } from 'vitest'
import type { DragEndEvent } from '@dnd-kit/core'

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

function dragEnd(activeId: string, activeData: object, overId: string | null) {
  return resolveFixedScoresDragEnd(
    {
      active: { id: activeId, data: { current: activeData } },
      over: overId ? { id: overId, data: { current: {} } } : null,
    } as unknown as DragEndEvent,
    { str: 15, dex: 14 },
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
    expect(
      resolveFixedScoresDragEnd(
        {
          active: {
            id: fixedScoresPoolDndId(13),
            data: { current: { kind: 'pool', score: 13 } },
          },
          over: { id: fixedScoresAbilityDropDndId('con'), data: { current: {} } },
        } as unknown as DragEndEvent,
        { str: 15 },
      ),
    ).toEqual({ str: 15, con: 13 })
  })

  it('replaces from pool on filled ability', () => {
    expect(
      dragEnd(
        fixedScoresPoolDndId(12),
        { kind: 'pool', score: 12 },
        fixedScoresAbilityDropDndId('str'),
      ),
    ).toEqual({ str: 12, dex: 14 })
  })

  it('moves assigned score to empty ability', () => {
    expect(
      dragEnd(
        fixedScoresAssignedDndId('str'),
        { kind: 'assigned', ability: 'str', score: 15 },
        fixedScoresAbilityDropDndId('con'),
      ),
    ).toEqual({ dex: 14, con: 15 })
  })

  it('swaps assigned scores between filled abilities', () => {
    expect(
      dragEnd(
        fixedScoresAssignedDndId('str'),
        { kind: 'assigned', ability: 'str', score: 15 },
        fixedScoresAbilityDropDndId('dex'),
      ),
    ).toEqual({ str: 14, dex: 15 })
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
      ),
    ).toBeNull()
  })
})
