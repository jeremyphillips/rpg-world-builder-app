import { describe, expect, it } from 'vitest'

import { dndBeyondCharacter133058471Response } from './dnd-beyond-character-fixtures'
import {
  dndBeyondCharacterDataSchema,
  dndBeyondCharacterResponseSchema,
} from './dnd-beyond-character.schema'

describe('dndBeyondCharacterResponseSchema', () => {
  it('parses the sample response envelope', () => {
    const parsed = dndBeyondCharacterResponseSchema.parse(dndBeyondCharacter133058471Response)
    expect(parsed.success).toBe(true)
    expect(parsed.data?.name).toBe('Presto')
    expect(parsed.data?.id).toBe(133058471)
  })

  it('allows unknown passthrough fields on volatile objects', () => {
    const parsed = dndBeyondCharacterResponseSchema.parse({
      success: true,
      message: null,
      data: {
        id: 1,
        name: 'Test',
        alignmentId: null,
        baseHitPoints: 1,
        bonusHitPoints: null,
        overrideHitPoints: null,
        removedHitPoints: 0,
        temporaryHitPoints: 0,
        futureUpstreamField: { nested: true },
      },
      unexpectedEnvelopeField: true,
    })

    expect(parsed.data?.futureUpstreamField).toEqual({ nested: true })
    expect(parsed.unexpectedEnvelopeField).toBe(true)
  })

  it('parses null-heavy optional adapter fields', () => {
    const parsed = dndBeyondCharacterDataSchema.parse({
      id: 1,
      name: null,
      alignmentId: null,
      currentXp: 0,
      adjustmentXp: 0,
      stats: [{ id: 1, name: null, value: 10 }],
      bonusStats: [{ id: 1, name: null, value: null }],
      overrideStats: [{ id: 1, name: null, value: null }],
      baseHitPoints: null,
      bonusHitPoints: null,
      overrideHitPoints: null,
      removedHitPoints: null,
      temporaryHitPoints: null,
      traits: {
        personalityTraits: null,
        ideals: null,
        bonds: null,
        flaws: null,
        appearance: null,
      },
      notes: {
        backstory: null,
      },
    })

    expect(parsed.name).toBeNull()
    expect(parsed.stats?.[0]?.value).toBe(10)
  })

  it('fails malformed adapter-critical stat rows with useful paths', () => {
    const result = dndBeyondCharacterDataSchema.safeParse({
      id: 1,
      name: 'Broken',
      alignmentId: null,
      baseHitPoints: 1,
      bonusHitPoints: null,
      overrideHitPoints: null,
      removedHitPoints: 0,
      temporaryHitPoints: 0,
      stats: [{ id: 'not-a-number', name: null, value: 8 }],
    })

    expect(result.success).toBe(false)
    if (result.success) return
    expect(result.error.issues.some((issue) => issue.path.join('.').includes('stats'))).toBe(true)
  })

  it('parses unsuccessful response envelopes', () => {
    const parsed = dndBeyondCharacterResponseSchema.parse({
      success: false,
      message: 'Character not found',
      data: null,
    })

    expect(parsed.success).toBe(false)
    expect(parsed.data).toBeNull()
  })
})
