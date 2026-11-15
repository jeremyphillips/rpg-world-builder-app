import { describe, expect, it } from 'vitest'

import { ELDRITCH_BLAST_RESOLUTION, RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID } from '@rpg/contracts'

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
        applications: [{ effectId: RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID, amount: 'full' }],
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

  it('round-trips save outcome effects, repeat save, and failure-or-success', () => {
    const method = { kind: 'saving-throw' as const, ability: 'con' as const }
    const stored = [
      {
        result: 'failed-save' as const,
        applications: [{ effectId: RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID, amount: 'full' as const }],
        effects: [{ kind: 'condition' as const, conditionId: 'unconscious' as const }],
        repeatSave: {
          timing: {
            participant: 'target' as const,
            boundary: 'end' as const,
            which: 'next' as const,
          },
          successOnRepeatEndsEffect: true,
          secondFailure: { note: 'Second tier note.' },
        },
      },
      {
        result: 'successful-save' as const,
        applications: [{ effectId: RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID, amount: 'half' as const }],
      },
      {
        result: 'failed-or-successful-save' as const,
        applications: [],
        note: 'Being underwater does not grant resistance.',
      },
    ]

    const slots = storedOutcomesToFormSlots(method, stored)
    expect(slots).toHaveLength(3)
    expect(formOutcomesToStoredShape(method, slots)).toEqual(stored)
  })
})
