import { describe, expect, it } from 'vitest'

import {
  formatCreatureRollAdjustmentSentence,
  formatCreatureSaveOutcomeOverrideNotation,
} from './effects'

describe('formatCreatureRollAdjustmentSentence', () => {
  it('formats pack tactics without a creature subject', () => {
    expect(
      formatCreatureRollAdjustmentSentence({
        mode: 'advantage',
        rolls: [{ kind: 'attack' }],
        circumstance: { kind: 'ally-adjacent-to-target' },
      }),
    ).toBe(
      "Advantage on attack rolls against a creature if at least one ally is within 5 feet of the creature and the ally doesn't have the Incapacitated condition.",
    )
    expect(
      formatCreatureRollAdjustmentSentence({
        mode: 'advantage',
        rolls: [{ kind: 'attack' }],
        circumstance: { kind: 'ally-adjacent-to-target' },
      }),
    ).not.toMatch(/this creature/i)
  })
})

describe('formatCreatureSaveOutcomeOverrideNotation', () => {
  it('formats long-rest use notation', () => {
    expect(
      formatCreatureSaveOutcomeOverrideNotation({
        kind: 'uses',
        count: { kind: 'fixed', value: 3 },
        recovery: { minimumRest: 'long' },
      }),
    ).toBe('3/Day')
  })
})
