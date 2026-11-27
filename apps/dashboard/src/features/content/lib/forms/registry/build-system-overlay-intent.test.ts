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

  it('resets traits when homebrew additions are removed back to the catalog seed', () => {
    const baseline = {
      ...catalogSeed,
      traits: [...catalogSeed.traits, { id: 'homebrew-trait', name: 'Extra Senses', grants: [] }],
    } as Record<string, unknown>
    const draft = {
      ...catalogSeed,
      traits: [...catalogSeed.traits],
    } as Record<string, unknown>

    const intent = buildSystemOverlayIntentFromForms({
      participantId: 'monsters',
      catalogSeed: catalogSeed as unknown as Record<string, unknown>,
      baseline,
      draft,
      validationIntent: 'publish',
    })

    expect(intent.collections?.traits).toEqual({ reset: true })
  })

  it('removes one homebrew trait with removedIds when another homebrew row remains', () => {
    const baseline = {
      ...catalogSeed,
      traits: [
        ...catalogSeed.traits,
        { id: 'homebrew-a', name: 'Extra A', grants: [] },
        { id: 'homebrew-b', name: 'Extra B', grants: [] },
      ],
    } as Record<string, unknown>
    const draft = {
      ...catalogSeed,
      traits: [...catalogSeed.traits, { id: 'homebrew-b', name: 'Extra B', grants: [] }],
    } as Record<string, unknown>

    const intent = buildSystemOverlayIntentFromForms({
      participantId: 'monsters',
      catalogSeed: catalogSeed as unknown as Record<string, unknown>,
      baseline,
      draft,
      validationIntent: 'publish',
    })

    expect(intent.collections?.traits).toMatchObject({
      removedIds: ['homebrew-a'],
    })
  })
})
