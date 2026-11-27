import { describe, expect, it } from 'vitest'

import { applyStoredOverlay } from './apply'
import { compileOverlayPolicy } from './compile-policy'
import { overlayDeleteIdRows, overlayRestoreIdRows } from './overlay-presets'
import { parseStoredOverlayInput } from './legacy'
import { reconcileOverlayUpdate } from './reconcile'
import { z } from 'zod'

const traitRowSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
})

const restoreFixtureSchema = z.object({
  name: z.string().min(1),
  traits: overlayRestoreIdRows(traitRowSchema),
})

const deleteFixtureSchema = z.object({
  name: z.string().min(1),
  features: overlayDeleteIdRows(traitRowSchema),
})

function policyFor(schema: z.ZodType) {
  const compiled = compileOverlayPolicy(schema)
  if (!compiled.ok) throw new Error(compiled.issues.join('\n'))
  return compiled.policy
}

describe('overlay legacy gates', () => {
  const seed = {
    name: 'Owlbear',
    traits: [{ id: 'keen-sight', name: 'Keen Sight' }],
  }
  const policy = policyFor(restoreFixtureSchema)

  it('rejects an unversioned stored patch', () => {
    const apply = applyStoredOverlay(seed, { traits: [] }, policy)
    expect(apply.ok).toBe(false)
    if (apply.ok) return
    expect(apply.failure).toEqual({ code: 'unsupported-overlay-version', version: undefined })

    const reconcile = reconcileOverlayUpdate(seed, { traits: [] }, {}, policy)
    expect(reconcile.ok).toBe(false)
  })

  it('rejects an unknown overlay version', () => {
    const failure = parseStoredOverlayInput({ version: 2, revision: 0 })
    expect(failure).toEqual({
      ok: false,
      failure: { code: 'unsupported-overlay-version', version: 2 },
    })
  })

  it('fails closed on legacy-array and legacy-hold retention', () => {
    const legacyArray = applyStoredOverlay(
      seed,
      {
        version: 1,
        revision: 1,
        collections: { traits: { kind: 'legacy-array', rows: [{ id: 'keen-sight' }] } },
      },
      policy,
    )
    expect(legacyArray.ok).toBe(false)
    if (legacyArray.ok) return
    expect(legacyArray.failure.code).toBe('unsupported-overlay-retention')

    const legacyHold = applyStoredOverlay(
      seed,
      {
        version: 1,
        revision: 1,
        collections: {
          traits: {
            kind: 'identity',
            overrides: [
              { origin: 'seed', id: 'keen-sight', retention: 'legacy', row: { id: 'keen-sight' } },
            ],
            additions: [],
            removedIds: [],
          },
        },
      },
      policy,
    )
    expect(legacyHold.ok).toBe(false)
    if (legacyHold.ok) return
    expect(legacyHold.failure.code).toBe('unsupported-overlay-retention')
  })

  it('rejects malformed version 1 overlays as validation failures', () => {
    const parsed = parseStoredOverlayInput({ version: 1, revision: -1 })
    expect(parsed.ok).toBe(false)
    if (parsed.ok) return
    expect(parsed.failure.code).toBe('overlay-validation')
  })

  it('strips nested null leaves on identity overrides', () => {
    const parsed = parseStoredOverlayInput({
      version: 1,
      revision: 1,
      collections: {
        traits: {
          kind: 'identity',
          overrides: [
            {
              origin: 'seed',
              id: 'a',
              set: { name: 'x' },
              clear: null,
              restore: null,
              collections: null,
            },
          ],
          additions: [],
          removedIds: [],
        },
      },
    })
    expect(parsed.ok).toBe(true)
  })

  it('treats null optional envelope fields as absent (mongoose wire shape)', () => {
    const parsed = parseStoredOverlayInput({
      version: 1,
      revision: 1,
      set: { name: 'Patched' },
      restore: null,
      collections: null,
    })
    expect(parsed).toEqual({
      ok: true,
      overlay: { version: 1, revision: 1, set: { name: 'Patched' } },
    })
  })

  it('delete and restore policies diverge on removed seed ids', () => {
    const restorePolicy = policyFor(restoreFixtureSchema)
    const deletePolicy = policyFor(deleteFixtureSchema)
    const intent = { collections: { traits: { removedIds: ['keen-sight'] } } }

    const restore = reconcileOverlayUpdate(seed, { version: 1, revision: 0 }, intent, restorePolicy)
    expect(restore.ok).toBe(false)

    const remove = reconcileOverlayUpdate(
      { name: 'Swarm', features: [{ id: 'split', name: 'Split' }] },
      { version: 1, revision: 0 },
      { collections: { features: { removedIds: ['split'] } } },
      deletePolicy,
    )
    expect(remove.ok).toBe(true)
    if (!remove.ok) return
    expect(remove.result.body).toEqual({ name: 'Swarm', features: [] })
  })
})
