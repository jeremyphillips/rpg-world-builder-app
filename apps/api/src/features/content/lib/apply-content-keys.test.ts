import { describe, expect, it } from 'vitest'

import { applyStableNestedContentKeys, deriveEnvelopeSlugFromInput } from './apply-content-keys'
import { ContentKeyError } from '@rpg/contracts'

describe('deriveEnvelopeSlugFromInput', () => {
  it('derives slug from name', () => {
    expect(deriveEnvelopeSlugFromInput({ name: 'Custom Leather' })).toBe('custom-leather')
  })
})

describe('applyStableNestedContentKeys', () => {
  it('derives feature ids on create', () => {
    const body = applyStableNestedContentKeys({
      features: [{ name: 'Rage', level: 1 }],
    })

    expect(body.features).toEqual([{ name: 'Rage', level: 1, id: 'rage' }])
  })

  it('preserves existing feature ids on update', () => {
    const existing = {
      features: [{ id: 'rage', name: 'Rage', level: 1 }],
    }
    const body = applyStableNestedContentKeys(
      {
        features: [{ id: 'rage', name: 'Battle Rage', level: 1 }],
      },
      existing,
    )

    expect(body.features).toEqual([{ id: 'rage', name: 'Battle Rage', level: 1 }])
  })

  it('rejects rename-in-place on update', () => {
    const existing = {
      features: [{ id: 'rage', name: 'Rage', level: 1 }],
    }

    expect(() =>
      applyStableNestedContentKeys(
        {
          features: [{ id: 'battle-rage', name: 'Rage', level: 1 }],
        },
        existing,
      ),
    ).toThrow(ContentKeyError)
  })

  it('assigns stable ids to nested heritage options', () => {
    const body = applyStableNestedContentKeys({
      heritage: {
        name: 'Draconic Ancestry',
        kind: 'ancestry',
        options: [{ name: 'Black Dragon' }],
      },
    })

    expect(body.heritage).toEqual({
      name: 'Draconic Ancestry',
      kind: 'ancestry',
      id: 'draconic-ancestry',
      options: [{ name: 'Black Dragon', id: 'black-dragon' }],
    })
  })
})
