import { describe, expect, it } from 'vitest'

import type { FormatCreatureTraitInput } from './format-creature-trait'

type ExpectNotAssignable<T, U> = T extends U ? never : true

describe('formatCreatureTrait input types', () => {
  it('accepts canonical preset ids and rejects unknown presets', () => {
    const packTactics: FormatCreatureTraitInput = {
      subject: 'the wolf',
      trait: { preset: 'pack-tactics' },
    }
    const spiderClimb: FormatCreatureTraitInput = {
      subject: 'the bat',
      trait: { preset: 'spider-climb' },
    }

    type UnknownPreset = { subject: string; trait: { preset: 'not-a-trait-id' } }
    const unknownPresetBlocked: ExpectNotAssignable<UnknownPreset, FormatCreatureTraitInput> = true

    expect(packTactics.trait.preset).toBe('pack-tactics')
    expect(spiderClimb.trait.preset).toBe('spider-climb')
    expect(unknownPresetBlocked).toBe(true)
  })
})
