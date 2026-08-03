import { describe, expect, it } from 'vitest'

import { applyBuildingArchetypeValueSync } from './location-form-sync'

describe('applyBuildingArchetypeValueSync', () => {
  it('returns undefined when specialization and override are already clear', () => {
    expect(
      applyBuildingArchetypeValueSync({
        classification: { archetype: 'inn' },
      }),
    ).toBeUndefined()
  })

  it('clears specialization and function override when archetype changes', () => {
    expect(
      applyBuildingArchetypeValueSync({
        classification: {
          archetype: 'temple',
          specialization: 'Sea temple',
          functionOverride: 'care',
        },
      }),
    ).toEqual({
      classification: {
        archetype: 'temple',
        specialization: undefined,
        functionOverride: undefined,
      },
    })
  })
})
