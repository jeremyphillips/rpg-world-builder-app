import { describe, expect, it } from 'vitest'

import {
  creatureRollTargetSchema,
  formatCreatureRollAdjustmentSentence,
  formatCreatureSaveOutcomeOverrideNotation,
} from './effects'

describe('creatureRollTargetSchema', () => {
  it('allows an ability check without an ability or skill', () => {
    expect(creatureRollTargetSchema.parse({ kind: 'ability-check' })).toEqual({
      kind: 'ability-check',
    })
  })

  it('keeps ability-scoped checks and rejects skill without ability', () => {
    expect(creatureRollTargetSchema.parse({ kind: 'ability-check', ability: 'wis' })).toEqual({
      kind: 'ability-check',
      ability: 'wis',
    })
    expect(
      creatureRollTargetSchema.parse({
        kind: 'ability-check',
        ability: 'wis',
        skillId: 'perception',
      }),
    ).toEqual({
      kind: 'ability-check',
      ability: 'wis',
      skillId: 'perception',
    })
    expect(
      creatureRollTargetSchema.safeParse({ kind: 'ability-check', skillId: 'perception' }).success,
    ).toBe(false)
  })
})

describe('formatCreatureRollAdjustmentSentence', () => {
  it('prints unqualified ability checks when ability is omitted', () => {
    expect(
      formatCreatureRollAdjustmentSentence({
        mode: 'disadvantage',
        rolls: [{ kind: 'attack' }, { kind: 'ability-check' }],
        circumstance: { kind: 'in-sunlight' },
      }),
    ).toBe('Disadvantage on attack rolls and ability checks while in sunlight.')
  })
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
