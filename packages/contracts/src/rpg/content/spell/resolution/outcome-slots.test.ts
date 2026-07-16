import { describe, expect, it } from 'vitest'

import { SPELL_RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID } from './schema'
import {
  buildDefaultOutcomeSlots,
  ensureOutcomeSlotsForMethod,
  findOutcomeByResult,
  getOutcomeResultsForMethod,
  hasMeaningfulOutcomeContent,
  isOutcomeEmpty,
  normalizeOutcomeOrder,
  stripEmptyOutcomeSlots,
  supportsPartialApplicationForEffectKind,
  type OutcomeLike,
} from './outcome-slots'

describe('getOutcomeResultsForMethod', () => {
  it('maps automatic, attack, and saving-throw methods to stable slot order', () => {
    expect(getOutcomeResultsForMethod({ kind: 'automatic' })).toEqual(['applied'])
    expect(getOutcomeResultsForMethod({ kind: 'attack', attackType: 'melee-spell' })).toEqual([
      'hit',
      'miss',
    ])
    expect(getOutcomeResultsForMethod({ kind: 'attack', attackType: 'ranged-spell' })).toEqual([
      'hit',
      'miss',
    ])
    expect(getOutcomeResultsForMethod({ kind: 'saving-throw', ability: 'con' })).toEqual([
      'failed-save',
      'successful-save',
    ])
  })
})

describe('outcome slot helpers', () => {
  const attackOutcomes: OutcomeLike[] = [
    {
      result: 'hit' as const,
      applications: [
        { effectId: SPELL_RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID, amount: 'full' as const },
      ],
    },
  ]

  it('hydrates empty miss slot without dropping stored hit outcome', () => {
    const method = { kind: 'attack' as const, attackType: 'ranged-spell' as const }
    const hydrated = ensureOutcomeSlotsForMethod(method, attackOutcomes, (result) => ({
      result,
      applications: [],
    }))

    expect(hydrated).toHaveLength(2)
    expect(hydrated[0]?.result).toBe('hit')
    expect(hydrated[1]).toEqual({ result: 'miss', applications: [] })
  })

  it('strips empty form slots before stored normalization', () => {
    const method = { kind: 'attack' as const, attackType: 'ranged-spell' as const }
    const formSlots = ensureOutcomeSlotsForMethod(method, attackOutcomes, (result) => ({
      result,
      applications: [],
    }))

    expect(stripEmptyOutcomeSlots(formSlots)).toEqual(attackOutcomes)
  })

  it('preserves miss-only prose in stored shape', () => {
    const missOnly = [
      {
        result: 'miss' as const,
        applications: [],
        note: 'Creates a cloud at the point of impact.',
      },
    ]

    expect(hasMeaningfulOutcomeContent(missOnly[0]!)).toBe(true)
    expect(isOutcomeEmpty(missOnly[0]!)).toBe(false)
    expect(stripEmptyOutcomeSlots(missOnly)).toEqual(missOnly)
  })

  it('orders outcomes by method slot order', () => {
    const method = { kind: 'saving-throw' as const, ability: 'con' as const }
    const shuffled = [
      {
        result: 'successful-save' as const,
        applications: [
          { effectId: SPELL_RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID, amount: 'half' as const },
        ],
      },
      {
        result: 'failed-save' as const,
        applications: [
          { effectId: SPELL_RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID, amount: 'full' as const },
        ],
      },
    ]

    expect(normalizeOutcomeOrder(method, shuffled).map((outcome) => outcome.result)).toEqual([
      'failed-save',
      'successful-save',
    ])
  })

  it('finds outcomes by result', () => {
    expect(findOutcomeByResult(attackOutcomes, 'hit')?.applications).toHaveLength(1)
    expect(findOutcomeByResult(attackOutcomes, 'miss')).toBeUndefined()
  })
})

describe('buildDefaultOutcomeSlots', () => {
  it('generates intuitive defaults for each method', () => {
    const effectId = SPELL_RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID

    expect(buildDefaultOutcomeSlots({ kind: 'automatic' }, effectId)).toEqual([
      { result: 'applied', applications: [{ effectId, amount: 'full' }] },
    ])

    expect(
      buildDefaultOutcomeSlots({ kind: 'attack', attackType: 'ranged-spell' }, effectId),
    ).toEqual([
      { result: 'hit', applications: [{ effectId, amount: 'full' }] },
      { result: 'miss', applications: [] },
    ])

    expect(buildDefaultOutcomeSlots({ kind: 'saving-throw', ability: 'con' }, effectId)).toEqual([
      { result: 'failed-save', applications: [{ effectId, amount: 'full' }] },
      { result: 'successful-save', applications: [{ effectId, amount: 'half' }] },
    ])
  })
})

describe('supportsPartialApplicationForEffectKind', () => {
  it('allows half only for damage in the MVP', () => {
    expect(supportsPartialApplicationForEffectKind('damage')).toBe(true)
    expect(supportsPartialApplicationForEffectKind('healing')).toBe(false)
    expect(supportsPartialApplicationForEffectKind('temporary-hit-points')).toBe(false)
  })
})
