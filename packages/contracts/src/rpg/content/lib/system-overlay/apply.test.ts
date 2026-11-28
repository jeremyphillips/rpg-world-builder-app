import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import { applyStoredOverlay } from './apply'
import { compileOverlayPolicy } from './compile-policy'
import {
  overlayDeleteEntryIdRows,
  overlayImmaterialIdRows,
  overlayOrderedList,
  overlayRestoreIdRows,
} from './overlay-presets'
import { reconcileOverlayUpdate } from './reconcile'

const traitRowSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  kind: z.enum(['special', 'attack']).optional(),
  grants: overlayImmaterialIdRows(
    z.object({
      id: z.string().min(1),
      label: z.string().optional(),
    }),
  ).optional(),
})

const fixtureSchema = z.object({
  name: z.string().min(1),
  tags: overlayOrderedList(z.string()),
  traits: overlayRestoreIdRows(traitRowSchema),
  equipment: overlayDeleteEntryIdRows(
    z.object({ entryId: z.string().min(1), label: z.string().min(1) }),
  ),
})

function requirePolicy() {
  const compiled = compileOverlayPolicy(fixtureSchema)
  if (!compiled.ok) throw new Error(compiled.issues.join('\n'))
  return compiled.policy
}

const seed = {
  name: 'Owlbear',
  tags: ['beast', 'monstrosity'],
  traits: [
    { id: 'keen-sight', name: 'Keen Sight', grants: [{ id: 'grt_a', label: 'Perception' }] },
    { id: 'pounce', name: 'Pounce' },
  ],
  equipment: [{ entryId: 'club', label: 'Club' }],
}

describe('applyStoredOverlay', () => {
  const policy = requirePolicy()

  it('returns the seed when overlay content is empty', () => {
    const result = applyStoredOverlay(seed, null, policy)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.body).toEqual(seed)
  })

  it('applies scalar and value-list overrides', () => {
    const result = applyStoredOverlay(
      seed,
      { version: 1, revision: 0, set: { name: 'Custom Owlbear', tags: ['beast', 'custom'] } },
      policy,
    )
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.body.name).toBe('Custom Owlbear')
    expect(result.result.body.tags).toEqual(['beast', 'custom'])
  })

  it('merges seed overrides, homebrew additions, and removals', () => {
    const result = applyStoredOverlay(
      seed,
      {
        version: 1,
        revision: 2,
        collections: {
          traits: {
            kind: 'identity',
            overrides: [{ origin: 'seed', id: 'keen-sight', set: { name: 'Sharp Sight' } }],
            additions: [{ origin: 'homebrew', id: 'extra', row: { id: 'extra', name: 'Extra' } }],
            removedIds: ['pounce'],
          },
          equipment: {
            kind: 'identity',
            overrides: [],
            additions: [],
            removedIds: ['club'],
          },
        },
      },
      policy,
    )
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.body.traits).toEqual([
      { id: 'keen-sight', name: 'Sharp Sight', grants: [{ id: 'grt_a', label: 'Perception' }] },
      { id: 'extra', name: 'Extra' },
    ])
    expect(result.result.body.equipment).toEqual([])
  })

  it('reports identity conflicts and orphaned seed overrides', () => {
    const result = applyStoredOverlay(
      { ...seed, traits: [{ id: 'keen-sight', name: 'Keen Sight' }] },
      {
        version: 1,
        revision: 1,
        collections: {
          traits: {
            kind: 'identity',
            overrides: [{ origin: 'seed', id: 'removed', set: { name: 'Gone' } }],
            additions: [
              {
                origin: 'homebrew',
                id: 'keen-sight',
                row: { id: 'keen-sight', name: 'Collision' },
              },
            ],
            removedIds: [],
          },
        },
      },
      policy,
    )
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.diagnostics.orphanedSeedOverrides).toEqual(['removed'])
    expect(result.result.diagnostics.identityConflicts).toEqual(['keen-sight'])
    expect(result.result.body.traits).toEqual([{ id: 'keen-sight', name: 'Keen Sight' }])
  })

  it('uses stored order when authored', () => {
    const result = applyStoredOverlay(
      seed,
      {
        version: 1,
        revision: 1,
        collections: {
          traits: {
            kind: 'identity',
            overrides: [],
            additions: [{ origin: 'homebrew', id: 'extra', row: { id: 'extra', name: 'Extra' } }],
            removedIds: [],
            order: ['extra', 'keen-sight', 'pounce'],
          },
        },
      },
      policy,
    )
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect((result.result.body.traits as Array<{ id: string }>).map((row) => row.id)).toEqual([
      'extra',
      'keen-sight',
      'pounce',
    ])
  })

  it('replaces a union branch wholesale', () => {
    const unionSchema = z.object({
      name: z.string(),
      traits: overlayRestoreIdRows(
        z.discriminatedUnion('kind', [
          z.object({
            kind: z.literal('special'),
            id: z.string(),
            name: z.string(),
            detail: z.string(),
          }),
          z.object({
            kind: z.literal('attack'),
            id: z.string(),
            name: z.string(),
            bonus: z.number(),
          }),
        ]),
      ),
    })
    const unionPolicy = compileOverlayPolicy(unionSchema)
    if (!unionPolicy.ok) throw new Error('compile failed')
    const unionSeed = {
      name: 'Test',
      traits: [{ kind: 'special', id: 'a', name: 'A', detail: 'old' }],
    }
    const applied = applyStoredOverlay(
      unionSeed,
      {
        version: 1,
        revision: 0,
        collections: {
          traits: {
            kind: 'identity',
            overrides: [
              {
                origin: 'seed',
                id: 'a',
                mode: 'replace',
                row: { kind: 'attack', id: 'a', name: 'A', bonus: 5 },
              },
            ],
            additions: [],
            removedIds: [],
          },
        },
      },
      unionPolicy.policy,
    )
    expect(applied.ok).toBe(true)
    if (!applied.ok) return
    expect(applied.result.body.traits).toEqual([{ kind: 'attack', id: 'a', name: 'A', bonus: 5 }])
  })
})

describe('apply and reconcile agreement', () => {
  const policy = requirePolicy()

  it('agrees on the resolved body after an update', () => {
    const intent = {
      set: { name: 'Edited' },
      collections: {
        traits: {
          overrides: [{ origin: 'seed' as const, id: 'keen-sight', set: { name: 'Sight' } }],
        },
      },
    }
    const reconciled = reconcileOverlayUpdate(seed, { version: 1, revision: 3 }, intent, policy)
    expect(reconciled.ok).toBe(true)
    if (!reconciled.ok) return
    const applied = applyStoredOverlay(seed, reconciled.result.stored, policy)
    expect(applied.ok).toBe(true)
    if (!applied.ok) return
    expect(applied.result.body).toEqual(reconciled.result.body)
  })
})
