import { describe, expect, it } from 'vitest'

import { RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID } from './schema'
import {
  buildDefaultOutcomeSlots,
  ensureOutcomeSlotsForMethod,
  findOutcomeByResult,
  getAllowedOutcomeResultsForMethod,
  getOptionalOutcomeResultsForMethod,
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
    expect(getOutcomeResultsForMethod({ kind: 'attack' })).toEqual(['hit', 'miss'])
    expect(getOutcomeResultsForMethod({ kind: 'saving-throw' })).toEqual([
      'failed-save',
      'successful-save',
    ])
  })

  it('lists optional save outcomes separately from required slots', () => {
    expect(getOptionalOutcomeResultsForMethod({ kind: 'saving-throw' })).toEqual([
      'failed-or-successful-save',
    ])
    expect(getAllowedOutcomeResultsForMethod({ kind: 'saving-throw' })).toEqual([
      'failed-save',
      'successful-save',
      'failed-or-successful-save',
    ])
  })
})

describe('outcome slot helpers', () => {
  const attackOutcomes: OutcomeLike[] = [
    {
      result: 'hit' as const,
      effects: [
        { kind: 'effect-reference', effectId: RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID, amount: 'full' },
      ],
    },
  ]

  it('preserves optional failure-or-success without auto-creating the slot', () => {
    const method = { kind: 'saving-throw' as const, ability: 'con' as const }
    const hydrated = ensureOutcomeSlotsForMethod(method, [], (result) => ({
      result,
      effects: [],
    }))
    expect(hydrated.map((outcome) => outcome.result)).toEqual(['failed-save', 'successful-save'])

    const withOptional = ensureOutcomeSlotsForMethod(
      method,
      [
        {
          result: 'failed-or-successful-save',
          effects: [{ kind: 'note' as const, description: 'Rider.' }],
        },
      ],
      (result): OutcomeLike => ({ result, effects: [] }),
    )
    expect(withOptional.map((outcome) => outcome.result)).toEqual([
      'failed-save',
      'successful-save',
      'failed-or-successful-save',
    ])
  })

  it('hydrates empty miss slot without dropping stored hit outcome', () => {
    const method = { kind: 'attack' as const, attackType: 'ranged-spell' as const }
    const hydrated = ensureOutcomeSlotsForMethod(method, attackOutcomes, (result) => ({
      result,
      effects: [],
    }))

    expect(hydrated).toHaveLength(2)
    expect(hydrated[0]?.result).toBe('hit')
    expect(hydrated[1]).toEqual({ result: 'miss', effects: [] })
  })

  it('strips empty form slots before stored normalization', () => {
    const method = { kind: 'attack' as const, attackType: 'ranged-spell' as const }
    const formSlots = ensureOutcomeSlotsForMethod(method, attackOutcomes, (result) => ({
      result,
      effects: [],
    }))

    expect(stripEmptyOutcomeSlots(formSlots)).toEqual(attackOutcomes)
  })

  it('treats outcome effects and repeat save as meaningful content', () => {
    expect(
      hasMeaningfulOutcomeContent({
        result: 'failed-save',
        effects: [{ kind: 'condition', conditionId: 'restrained' }],
      }),
    ).toBe(true)
    expect(
      hasMeaningfulOutcomeContent({
        result: 'failed-save',
        effects: [],
        repeatSave: {
          timing: { participant: 'target', boundary: 'end', which: 'next' },
          successOnRepeatEndsEffect: true,
          secondFailure: { note: 'Second tier.' },
        },
      }),
    ).toBe(true)
    expect(stripEmptyOutcomeSlots([])).toEqual([])
  })

  it('orders optional failure-or-success after required save slots', () => {
    const method = { kind: 'saving-throw' as const, ability: 'con' as const }
    const ordered = normalizeOutcomeOrder(method, [
      {
        result: 'failed-or-successful-save',
        effects: [{ kind: 'note', description: 'Underwater rider.' }],
      },
      {
        result: 'successful-save',
        effects: [
          {
            kind: 'effect-reference',
            effectId: RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID,
            amount: 'half',
          },
        ],
      },
      {
        result: 'failed-save',
        effects: [
          {
            kind: 'effect-reference',
            effectId: RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID,
            amount: 'full',
          },
        ],
      },
    ])
    expect(ordered.map((outcome) => outcome.result)).toEqual([
      'failed-save',
      'successful-save',
      'failed-or-successful-save',
    ])
  })

  it('preserves miss-only prose in stored shape', () => {
    const missOnly = [
      {
        result: 'miss' as const,
        effects: [
          { kind: 'note' as const, description: 'Creates a cloud at the point of impact.' },
        ],
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
        effects: [
          {
            kind: 'effect-reference',
            effectId: RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID,
            amount: 'half',
          },
        ],
      },
      {
        result: 'failed-save' as const,
        effects: [
          {
            kind: 'effect-reference',
            effectId: RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID,
            amount: 'full',
          },
        ],
      },
    ]

    expect(normalizeOutcomeOrder(method, shuffled).map((outcome) => outcome.result)).toEqual([
      'failed-save',
      'successful-save',
    ])
  })

  it('finds outcomes by result', () => {
    expect(findOutcomeByResult(attackOutcomes, 'hit')?.effects).toHaveLength(1)
    expect(findOutcomeByResult(attackOutcomes, 'miss')).toBeUndefined()
  })
})

describe('buildDefaultOutcomeSlots', () => {
  it('generates intuitive defaults for each method', () => {
    const effectId = RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID

    expect(buildDefaultOutcomeSlots({ kind: 'automatic' }, effectId)).toEqual([
      {
        result: 'applied',
        effects: [{ kind: 'effect-reference', effectId, amount: 'full' }],
      },
    ])

    expect(buildDefaultOutcomeSlots({ kind: 'attack' }, effectId)).toEqual([
      { result: 'hit', effects: [{ kind: 'effect-reference', effectId, amount: 'full' }] },
      { result: 'miss', effects: [] },
    ])

    expect(buildDefaultOutcomeSlots({ kind: 'saving-throw' }, effectId)).toEqual([
      {
        result: 'failed-save',
        effects: [{ kind: 'effect-reference', effectId, amount: 'full' }],
      },
      {
        result: 'successful-save',
        effects: [{ kind: 'effect-reference', effectId, amount: 'half' }],
      },
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
