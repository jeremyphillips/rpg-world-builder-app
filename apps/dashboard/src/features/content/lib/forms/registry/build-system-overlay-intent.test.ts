import { describe, expect, it } from 'vitest'

import { buildSystemOverlayIntentFromForms } from './build-system-overlay-intent'

const catalogSeed = {
  name: 'Owlbear',
  tags: ['beast'],
  traits: [{ id: 'keen-sight', name: 'Keen Sight', grants: [{ id: 'grt_a' }] }],
} as const

describe('buildSystemOverlayIntentFromForms', () => {
  it('builds a name-only intent when traits remain loaded but unchanged', () => {
    const baseline = { ...catalogSeed, traits: [...catalogSeed.traits] } as Record<string, unknown>
    const draft = { ...baseline, name: 'Custom Owlbear' }
    const intent = buildSystemOverlayIntentFromForms({
      participantId: 'monsters',
      catalogSeed: catalogSeed as unknown as Record<string, unknown>,
      baseline,
      draft,
      validationIntent: 'publish',
    })
    expect(intent).toEqual({ set: { name: 'Custom Owlbear' } })
  })
})
