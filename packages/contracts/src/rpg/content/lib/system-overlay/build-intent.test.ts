import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import { applyStoredOverlay } from './apply'
import { buildSystemOverlayIntent } from './build-intent'
import { compileOverlayPolicy } from './compile-policy'
import {
  overlayImmaterialIdRows,
  overlayOrderedList,
  overlayRestoreIdRows,
} from './overlay-presets'
import { reconcileOverlayUpdate } from './reconcile'

const traitRowSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  grants: overlayImmaterialIdRows(
    z.object({ id: z.string().min(1), label: z.string().optional() }),
  ).optional(),
})

const fixtureSchema = z.object({
  name: z.string().min(1),
  tags: overlayOrderedList(z.string()),
  traits: overlayRestoreIdRows(traitRowSchema),
})

const policy = (() => {
  const compiled = compileOverlayPolicy(fixtureSchema)
  if (!compiled.ok) throw new Error(compiled.issues.join('\n'))
  return compiled.policy
})()

const seed = {
  name: 'Owlbear',
  tags: ['beast', 'monstrosity'],
  traits: [{ id: 'keen-sight', name: 'Keen Sight', grants: [{ id: 'grt_default' }] }],
}

describe('buildSystemOverlayIntent', () => {
  it('omits unchanged scalars when another collection is still mounted', () => {
    const baseline = { ...seed, traits: seed.traits }
    const draft = { ...seed, name: 'Custom Owlbear', traits: seed.traits }
    const intent = buildSystemOverlayIntent({ policy, catalogSeed: seed, baseline, draft })
    expect(intent).toEqual({ set: { name: 'Custom Owlbear' } })
  })

  it('stores nested row name edits without empty grants in intent', () => {
    const baseline = { ...seed }
    const draft = {
      ...seed,
      traits: [{ id: 'keen-sight', name: 'Sight', grants: [{ id: 'grt_default' }] }],
    }
    const intent = buildSystemOverlayIntent({ policy, catalogSeed: seed, baseline, draft })
    const first = reconcileOverlayUpdate(seed, { version: 1, revision: 0 }, intent, policy)
    expect(first.ok).toBe(true)
    if (!first.ok) return
    const applied = applyStoredOverlay(seed, first.result.stored, policy)
    expect(applied.ok).toBe(true)
    if (!applied.ok) return
    expect(applied.result.body).toEqual(draft)
  })

  it('resets a collection when draft matches the catalog seed after removing homebrew', () => {
    const baseline = {
      ...seed,
      traits: [...seed.traits, { id: 'extra', name: 'Extra' }],
    }
    const draft = { ...seed }
    const intent = buildSystemOverlayIntent({ policy, catalogSeed: seed, baseline, draft })
    expect(intent.collections?.traits).toEqual({ reset: true })
  })

  it('reconciles built intent to match draft for a scalar and nested trait edit', () => {
    const baseline = { ...seed }
    const draft = {
      ...seed,
      name: 'Edited',
      traits: [{ id: 'keen-sight', name: 'Keen', grants: [{ id: 'grt_default' }] }],
    }
    const intent = buildSystemOverlayIntent({ policy, catalogSeed: seed, baseline, draft })
    const result = reconcileOverlayUpdate(seed, { version: 1, revision: 0 }, intent, policy)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    const applied = applyStoredOverlay(seed, result.result.stored, policy)
    expect(applied.ok).toBe(true)
    if (!applied.ok) return
    expect(applied.result.body.name).toBe('Edited')
    expect(applied.result.body.traits).toEqual(draft.traits)
  })
})
