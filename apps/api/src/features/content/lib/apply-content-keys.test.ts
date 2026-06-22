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
        options: [{ name: 'Black Dragon' }],
      },
    })

    expect(body.heritage).toEqual({
      name: 'Draconic Ancestry',
      id: 'draconic-ancestry',
      options: [{ name: 'Black Dragon', id: 'black-dragon' }],
    })
  })

  it('preserves existing heritage ids on update', () => {
    const existing = {
      heritage: {
        id: 'draconic-ancestry',
        name: 'Draconic Ancestry',
        options: [{ id: 'black-dragon', name: 'Black Dragon' }],
      },
    }
    const body = applyStableNestedContentKeys(
      {
        heritage: {
          id: 'draconic-ancestry',
          name: 'Draconic Legacy',
          options: [{ id: 'black-dragon', name: 'Black Dragon' }],
        },
      },
      existing,
    )

    expect(body.heritage).toEqual({
      id: 'draconic-ancestry',
      name: 'Draconic Legacy',
      options: [{ id: 'black-dragon', name: 'Black Dragon' }],
    })
  })
})
