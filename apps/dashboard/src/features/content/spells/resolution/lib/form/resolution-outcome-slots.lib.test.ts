import { describe, expect, it } from 'vitest'

import {
  ELDRITCH_BLAST_RESOLUTION,
  SPELL_RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID,
} from '@rpg/contracts'

import {
  formOutcomesToStoredShape,
  hydrateOutcomeFormSlots,
  storedOutcomesToFormSlots,
} from './resolution-outcome-slots.lib'
import { resolutionToForm, resolutionToStored } from './resolution-form-values'

describe('resolution outcome slot adapters', () => {
  it('hydrates empty miss slot from stored attack outcomes', () => {
    const method = ELDRITCH_BLAST_RESOLUTION.method
    const slots = storedOutcomesToFormSlots(method, ELDRITCH_BLAST_RESOLUTION.outcomes)

    expect(slots.map((slot) => slot.result)).toEqual(['hit', 'miss'])
    expect(slots[1]).toEqual({ result: 'miss', applications: [] })
  })

  it('strips empty slots when converting form outcomes to stored shape', () => {
    const method = ELDRITCH_BLAST_RESOLUTION.method
    const formSlots = hydrateOutcomeFormSlots(method, [
      {
        result: 'hit',
        applications: [{ effectId: SPELL_RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID, amount: 'full' }],
      },
      { result: 'miss', applications: [] },
    ])

    expect(formOutcomesToStoredShape(method, formSlots)).toEqual(ELDRITCH_BLAST_RESOLUTION.outcomes)
  })

  it('round-trips miss-only prose through form hydration and stored normalization', () => {
    const method = { kind: 'attack' as const, attackType: 'ranged-spell' as const }
    const stored = [
      {
        result: 'miss' as const,
        applications: [],
        note: 'The projectile creates a cloud at the point of impact.',
      },
    ]

    const form = {
      ...resolutionToForm(ELDRITCH_BLAST_RESOLUTION)!,
      outcomes: storedOutcomesToFormSlots(method, stored),
    }

    expect(resolutionToStored(form)?.outcomes).toEqual(stored)
  })
})
