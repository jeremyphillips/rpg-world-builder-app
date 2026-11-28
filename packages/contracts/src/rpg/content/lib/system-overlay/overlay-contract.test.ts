import { describe, expect, it } from 'vitest'

import { parseSystemOverlayIntent, systemOverlayIntentSchema } from './intent'
import { parseStoredOverlay, storedOverlaySchema } from './stored'

describe('system overlay intent', () => {
  it('preserves an empty diff', () => {
    expect(parseSystemOverlayIntent({})).toEqual({})
  })

  it('does not invent collection values', () => {
    expect(parseSystemOverlayIntent({ set: { name: 'Swarm' } })).toEqual({ set: { name: 'Swarm' } })
    expect(systemOverlayIntentSchema.safeParse({ collections: { traits: {} } }).success).toBe(false)
  })

  it('rejects an unsafe id and a duplicate row', () => {
    expect(
      systemOverlayIntentSchema.safeParse({
        collections: {
          traits: { additions: [{ id: '__proto__', row: { name: 'x' } }] },
        },
      }).success,
    ).toBe(false)
    expect(
      systemOverlayIntentSchema.safeParse({
        collections: {
          traits: {
            additions: [
              { id: 'homebrew-a', row: { name: 'A' } },
              { id: 'homebrew-a', row: { name: 'B' } },
            ],
          },
        },
      }).success,
    ).toBe(false)
  })

  it('keeps a seed override distinct from a homebrew addition', () => {
    const parsed = parseSystemOverlayIntent({
      collections: {
        traits: {
          overrides: [{ origin: 'seed', id: 'swarm', set: { name: 'Pack' } }],
          additions: [{ id: 'homebrew-a', row: { id: 'homebrew-a', name: 'Extra' } }],
        },
      },
    })
    expect(parsed.collections?.traits?.overrides?.[0]).toMatchObject({
      origin: 'seed',
      id: 'swarm',
    })
    expect(parsed.collections?.traits?.additions?.[0]).toMatchObject({ id: 'homebrew-a' })
  })
})

describe('stored system overlay', () => {
  it('requires the canonical version', () => {
    expect(storedOverlaySchema.safeParse({ revision: 0 }).success).toBe(false)
    expect(storedOverlaySchema.safeParse({ traits: [] }).success).toBe(false)
    expect(parseStoredOverlay({ version: 1, revision: 0 })).toEqual({ version: 1, revision: 0 })
  })

  it('rejects a bare array where a collection must be tagged', () => {
    expect(
      storedOverlaySchema.safeParse({
        version: 1,
        revision: 1,
        collections: { traits: [] },
      }).success,
    ).toBe(false)
  })

  it('accepts a legacy array only behind its discriminator', () => {
    const parsed = parseStoredOverlay({
      version: 1,
      revision: 2,
      collections: { traits: { kind: 'legacy-array', rows: [{ id: 'swarm' }] } },
    })
    expect(parsed.collections?.traits).toEqual({ kind: 'legacy-array', rows: [{ id: 'swarm' }] })
  })

  it('rejects duplicate ids across overrides and additions', () => {
    expect(
      storedOverlaySchema.safeParse({
        version: 1,
        revision: 1,
        collections: {
          traits: {
            kind: 'identity',
            overrides: [{ origin: 'seed', id: 'same', set: { name: 'A' } }],
            additions: [{ origin: 'homebrew', id: 'same', row: { name: 'B' } }],
            removedIds: [],
          },
        },
      }).success,
    ).toBe(false)
  })
})
