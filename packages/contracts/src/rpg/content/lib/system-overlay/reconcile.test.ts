import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import { applyStoredOverlay } from './apply'
import { storedOverlaySchema } from './stored'
import { compileOverlayPolicy } from './compile-policy'
import { overlayImmaterialIdRows, overlayRestoreIdRows } from './overlay-presets'
import { reconcileOverlayUpdate } from './reconcile'
import { overlayValueEqual } from './value-equal'

const rowSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  grants: overlayImmaterialIdRows(z.object({ id: z.string().min(1) })).optional(),
})

const schema = z.object({
  name: z.string().min(1),
  traits: overlayRestoreIdRows(rowSchema),
})

const policy = (() => {
  const compiled = compileOverlayPolicy(schema)
  if (!compiled.ok) throw new Error(compiled.issues.join('\n'))
  return compiled.policy
})()

const seed = {
  name: 'Owlbear',
  traits: [{ id: 'keen-sight', name: 'Keen Sight', grants: [{ id: 'grt_default' }] }],
}

describe('reconcileOverlayUpdate', () => {
  it('leaves the stored overlay unchanged for a no-op intent', () => {
    const stored = {
      version: 1 as const,
      revision: 4,
      set: { name: 'Edited' },
    }
    const result = reconcileOverlayUpdate(seed, stored, {}, policy)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.unchanged).toBe(true)
    expect(result.result.stored).toEqual(stored)
  })

  it('does not grow the overlay when the same intent is applied twice', () => {
    const intent = { set: { name: 'Custom' } }
    const first = reconcileOverlayUpdate(seed, { version: 1, revision: 0 }, intent, policy)
    expect(first.ok).toBe(true)
    if (!first.ok) return
    const second = reconcileOverlayUpdate(seed, first.result.stored, intent, policy)
    expect(second.ok).toBe(true)
    if (!second.ok) return
    expect(overlayValueEqual(first.result.stored, second.result.stored)).toBe(true)
  })

  it('drops a scalar override that matches the current seed', () => {
    const result = reconcileOverlayUpdate(
      seed,
      { version: 1, revision: 0, set: { name: 'Stale' } },
      { set: { name: 'Owlbear' } },
      policy,
    )
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.stored.set).toBeUndefined()
    expect(result.result.body.name).toBe('Owlbear')
  })

  it('stores nested row edits without empty grant arrays', () => {
    const intent = {
      collections: {
        traits: {
          overrides: [{ origin: 'seed' as const, id: 'keen-sight', set: { name: 'Sight' } }],
        },
      },
    }
    const result = reconcileOverlayUpdate(seed, { version: 1, revision: 0 }, intent, policy)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    const override = result.result.stored.collections?.traits
    expect(override?.kind).toBe('identity')
    if (override?.kind !== 'identity') return
    expect(override.overrides[0]).toEqual({
      origin: 'seed',
      id: 'keen-sight',
      set: { name: 'Sight' },
    })
    const applied = applyStoredOverlay(seed, result.result.stored, policy)
    expect(applied.ok).toBe(true)
    if (!applied.ok) return
    expect(applied.result.body.traits).toEqual([
      { id: 'keen-sight', name: 'Sight', grants: [{ id: 'grt_default' }] },
    ])
  })

  it('resets a collection overlay on reset', () => {
    const stored = {
      version: 1 as const,
      revision: 2,
      collections: {
        traits: {
          kind: 'identity' as const,
          overrides: [{ origin: 'seed' as const, id: 'keen-sight', set: { name: 'Edited' } }],
          additions: [],
          removedIds: [],
        },
      },
    }
    const result = reconcileOverlayUpdate(
      seed,
      stored,
      { collections: { traits: { reset: true } } },
      policy,
    )
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.stored.collections).toBeUndefined()
    expect(result.result.body.traits).toEqual(seed.traits)
  })

  it('stores authored order only when it differs from canonical order', () => {
    const first = reconcileOverlayUpdate(
      seed,
      { version: 1, revision: 0 },
      {
        collections: {
          traits: {
            additions: [{ id: 'extra', row: { id: 'extra', name: 'Extra' } }],
            order: ['extra', 'keen-sight'],
          },
        },
      },
      policy,
    )
    expect(first.ok).toBe(true)
    if (!first.ok) return
    expect(first.result.stored.collections?.traits).toMatchObject({
      kind: 'identity',
      order: ['extra', 'keen-sight'],
    })

    const second = reconcileOverlayUpdate(
      seed,
      { version: 1, revision: 0 },
      {
        collections: {
          traits: {
            additions: [{ id: 'extra', row: { id: 'extra', name: 'Extra' } }],
          },
        },
      },
      policy,
    )
    expect(second.ok).toBe(true)
    if (!second.ok) return
    const storedTraits = second.result.stored.collections?.traits
    expect(storedTraits?.kind).toBe('identity')
    if (storedTraits?.kind !== 'identity') return
    expect(storedTraits.order).toBeUndefined()
  })

  it('clears stored order when restoreOrder is sent', () => {
    const stored = {
      version: 1 as const,
      revision: 1,
      collections: {
        traits: {
          kind: 'identity' as const,
          overrides: [],
          additions: [
            { origin: 'homebrew' as const, id: 'extra', row: { id: 'extra', name: 'Extra' } },
          ],
          removedIds: [],
          order: ['extra', 'keen-sight'],
        },
      },
    }
    const result = reconcileOverlayUpdate(
      seed,
      stored,
      { collections: { traits: { restoreOrder: true } } },
      policy,
    )
    expect(result.ok).toBe(true)
    if (!result.ok) return
    const traits = result.result.stored.collections?.traits
    expect(traits?.kind).toBe('identity')
    if (traits?.kind !== 'identity') return
    expect(traits.order).toBeUndefined()
  })

  it('round-trips nested SeedFieldDelta.collections on identity overrides', () => {
    const baseline = { ...seed }
    const draft = {
      ...seed,
      traits: [
        {
          id: 'keen-sight',
          name: 'Keen Sight',
          grants: [{ id: 'grt_default', label: 'More' }],
        },
      ],
    }
    const intent = {
      collections: {
        traits: {
          overrides: [
            {
              origin: 'seed' as const,
              id: 'keen-sight',
              collections: {
                grants: {
                  overrides: [
                    { origin: 'seed' as const, id: 'grt_default', set: { label: 'More' } },
                  ],
                },
              },
            },
          ],
        },
      },
    }
    const result = reconcileOverlayUpdate(baseline, { version: 1, revision: 0 }, intent, policy)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(storedOverlaySchema.parse(result.result.stored)).toEqual(result.result.stored)
    const applied = applyStoredOverlay(baseline, result.result.stored, policy)
    expect(applied.ok).toBe(true)
    if (!applied.ok) return
    expect(applied.result.body.traits).toEqual(draft.traits)
  })

  it('merges sequential SeedFieldDelta intents on the same seed row', () => {
    const first = reconcileOverlayUpdate(
      seed,
      { version: 1, revision: 0 },
      {
        collections: {
          traits: {
            overrides: [{ origin: 'seed' as const, id: 'keen-sight', set: { name: 'Sight' } }],
          },
        },
      },
      policy,
    )
    expect(first.ok).toBe(true)
    if (!first.ok) return
    const second = reconcileOverlayUpdate(
      seed,
      first.result.stored,
      {
        collections: {
          traits: {
            overrides: [{ origin: 'seed' as const, id: 'keen-sight', set: { name: 'Keen' } }],
          },
        },
      },
      policy,
    )
    expect(second.ok).toBe(true)
    if (!second.ok) return
    const override = second.result.stored.collections?.traits
    expect(override?.kind).toBe('identity')
    if (override?.kind !== 'identity') return
    expect(override.overrides[0]).toEqual({
      origin: 'seed',
      id: 'keen-sight',
      set: { name: 'Keen' },
    })
  })

  it('stores SeedRowReplace overrides', () => {
    const replace = reconcileOverlayUpdate(
      seed,
      { version: 1, revision: 0 },
      {
        collections: {
          traits: {
            overrides: [
              {
                origin: 'seed' as const,
                id: 'keen-sight',
                mode: 'replace' as const,
                row: { id: 'keen-sight', name: 'Replaced' },
              },
            ],
          },
        },
      },
      policy,
    )
    expect(replace.ok).toBe(true)
    if (!replace.ok) return
    const applied = applyStoredOverlay(seed, replace.result.stored, policy)
    expect(applied.ok).toBe(true)
    if (!applied.ok) return
    expect(applied.result.body.traits).toEqual([{ id: 'keen-sight', name: 'Replaced' }])
  })
})
