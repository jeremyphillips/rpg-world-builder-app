import { describe, expect, it } from 'vitest'

import type { MonsterActionDraftRow } from '../monster-action-presets'
import { clampMultiattackReplacementActions } from './monster-multiattack-replacement-form-sync'

const bite = { id: 'bite', kind: 'natural-weapon', name: 'Bite' } as MonsterActionDraftRow

function multiattack(
  steps: { count: number; actionIds: string[] }[],
  replacement: { count: number; replacesActionId?: string },
): MonsterActionDraftRow {
  return {
    id: 'multiattack',
    kind: 'multiattack',
    name: 'Multiattack',
    steps,
    replacement,
  } as MonsterActionDraftRow
}

describe('clampMultiattackReplacementActions', () => {
  it('clamps count when primary attack slots shrink', () => {
    const before = [multiattack([{ count: 3, actionIds: ['bite'] }], { count: 3 }), bite]
    const after = [multiattack([{ count: 1, actionIds: ['bite'] }], { count: 3 }), bite]
    const { next, changed } = clampMultiattackReplacementActions(before, after)
    expect(changed).toBe(true)
    expect((next[0] as { replacement?: { count: number } }).replacement?.count).toBe(1)
  })

  it('clamps when a named target lowers the max', () => {
    const steps = [
      { count: 2, actionIds: ['bite'] },
      { count: 1, actionIds: ['claw'] },
    ]
    const before = [multiattack(steps, { count: 3 }), bite]
    const after = [multiattack(steps, { count: 3, replacesActionId: 'claw' }), bite]
    const { next, changed } = clampMultiattackReplacementActions(before, after)
    expect(changed).toBe(true)
    expect((next[0] as { replacement?: { count: number } }).replacement?.count).toBe(1)
  })

  it('does not clamp when only unrelated actions change', () => {
    const row = multiattack([{ count: 2, actionIds: ['bite'] }], { count: 2 })
    const before = [row, bite]
    const after = [row, { ...bite, name: 'Bite!' }]
    const { changed } = clampMultiattackReplacementActions(before, after)
    expect(changed).toBe(false)
  })
})
