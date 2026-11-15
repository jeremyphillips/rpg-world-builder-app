import { describe, expect, it } from 'vitest'

import { EFFECT_END_TIMING_OPTION_IDS, effectEndSchema } from '@rpg/contracts'

import {
  applyEffectEndAuthoringToRow,
  coalesceEffectEndFromAuthoring,
} from './normalize-effect-end-authoring'

describe('normalize effect end authoring', () => {
  it('coalesces turn-bound options into structured end values', () => {
    const end = coalesceEffectEndFromAuthoring({
      effectEndOption: EFFECT_END_TIMING_OPTION_IDS.sourceStartNext,
    })
    expect(end).toEqual({
      kind: 'turn-bound',
      participant: 'source',
      boundary: 'start',
      which: 'next',
    })
  })

  it('strips ephemeral option and persists validated end', () => {
    const row: Record<string, unknown> = {
      kind: 'condition',
      conditionId: 'paralyzed',
      effectEndOption: EFFECT_END_TIMING_OPTION_IDS.sourceStartNext,
    }
    applyEffectEndAuthoringToRow(row)
    expect(row.effectEndOption).toBeUndefined()
    expect(effectEndSchema.parse(row.end)).toEqual({
      kind: 'turn-bound',
      participant: 'source',
      boundary: 'start',
      which: 'next',
    })
  })

  it('keeps partial timed rows when duration is incomplete', () => {
    const row: Record<string, unknown> = {
      effectEndOption: EFFECT_END_TIMING_OPTION_IDS.timed,
      end: { value: 1 },
    }
    applyEffectEndAuthoringToRow(row)
    expect(row.end).toEqual({ kind: 'timed', value: 1 })
  })
})
