import { describe, expect, it } from 'vitest'

import { monsterActionSchema } from './index'

const target = {
  count: 1,
  kind: 'creature' as const,
  proximity: { kind: 'reach' as const },
}

function parseSave(resolution: Record<string, unknown>) {
  return monsterActionSchema.safeParse({
    id: 'save',
    kind: 'save',
    name: 'Breath',
    dcSource: { kind: 'ability', ability: 'con', proficient: true },
    resolution: {
      selectionMode: 'targets',
      target,
      method: { kind: 'saving-throw', ability: 'dex' },
      ...resolution,
    },
  })
}

describe('monster save damage linkage', () => {
  it('accepts a failed full reference paired with success none', () => {
    const result = parseSave({
      effects: [
        { id: 'fire', kind: 'damage', roll: { dice: { count: 1, faces: 6 } }, damageType: 'fire' },
      ],
      outcomes: [
        {
          result: 'failed-save',
          effects: [{ kind: 'effect-reference', effectId: 'fire', amount: 'full' }],
        },
        {
          result: 'successful-save',
          effects: [{ kind: 'effect-reference', effectId: 'fire', amount: 'none' }],
        },
      ],
    })
    expect(result.success).toBe(true)
  })

  it('rejects an orphan definition, a half failed amount, and an unmatched success reference', () => {
    const result = parseSave({
      effects: [
        {
          id: 'orphan',
          kind: 'damage',
          roll: { dice: { count: 1, faces: 6 } },
          damageType: 'fire',
        },
        { id: 'used', kind: 'damage', roll: { dice: { count: 1, faces: 6 } }, damageType: 'cold' },
      ],
      outcomes: [
        {
          result: 'failed-save',
          effects: [{ kind: 'effect-reference', effectId: 'used', amount: 'half' }],
        },
        {
          result: 'successful-save',
          effects: [{ kind: 'effect-reference', effectId: 'orphan', amount: 'full' }],
        },
      ],
    })
    expect(result.success).toBe(false)
    if (result.success) return
    const messages = result.error.issues.map((issue) => issue.message)
    expect(messages).toContain('Each damage definition is referenced by the failed save.')
    expect(messages).toContain('Failed save damage is the full amount.')
    expect(messages).toContain('Successful save damage must match a failed-save damage definition.')
  })
})
