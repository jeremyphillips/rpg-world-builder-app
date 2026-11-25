import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import { monsterBodySchema } from '../../monster'
import { classBodySchema, subclassBodySchema } from '../../classes/class'
import { generalTableSchema } from '../../tables/general-table'
import { compileOverlayPolicy } from './compile-policy'
import { spellBodySchema } from '../../spell/body'
import { overlayRestoreIdRows } from './overlay-presets'

describe('overlay policy semantics on publish schemas', () => {
  it('monster traits are identity restore rows', () => {
    const result = compileOverlayPolicy(monsterBodySchema)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.policy).toMatchObject({
      kind: 'deep',
      fields: {
        traits: {
          kind: 'identity',
          idKey: 'id',
          missingSeedRow: 'restore',
          order: 'authored',
        },
      },
    })
  })

  it('monster equipment uses entryId delete rows', () => {
    const result = compileOverlayPolicy(monsterBodySchema)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.policy).toMatchObject({
      kind: 'deep',
      fields: {
        equipment: {
          kind: 'identity',
          idKey: 'entryId',
          missingSeedRow: 'delete',
        },
      },
    })
  })

  it('class features restore and subclass features delete', () => {
    const classResult = compileOverlayPolicy(classBodySchema)
    expect(classResult.ok).toBe(true)
    if (!classResult.ok) return
    expect(classResult.policy).toMatchObject({
      kind: 'deep',
      fields: {
        features: {
          kind: 'identity',
          missingSeedRow: 'restore',
        },
      },
    })

    const subclassResult = compileOverlayPolicy(subclassBodySchema)
    expect(subclassResult.ok).toBe(true)
    if (!subclassResult.ok) return
    expect(subclassResult.policy).toMatchObject({
      kind: 'deep',
      fields: {
        features: {
          kind: 'identity',
          missingSeedRow: 'delete',
        },
      },
    })
  })

  it('general table rows delete with authored order', () => {
    const result = compileOverlayPolicy(generalTableSchema)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.policy).toMatchObject({
      kind: 'deep',
      fields: {
        rows: {
          kind: 'identity',
          missingSeedRow: 'delete',
          order: 'authored',
        },
      },
    })
  })

  it('spell effects restore identity collections', () => {
    const result = compileOverlayPolicy(spellBodySchema)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    if (result.policy.kind !== 'deep') throw new Error('expected deep root policy')
    const resolution = result.policy.fields.resolution
    expect(resolution?.kind).toBe('deep')
    if (resolution?.kind !== 'deep') return
    expect(resolution.fields.effects).toMatchObject({
      kind: 'identity',
      missingSeedRow: 'restore',
    })
  })
})

describe('shared annotated collection reuse', () => {
  it('reuses the same trait row policy without path overrides', () => {
    const rowSchema = overlayRestoreIdRows(
      z.object({ id: z.string().min(1), name: z.string().min(1) }),
    )
    const left = compileOverlayPolicy(z.object({ traits: rowSchema }))
    const right = compileOverlayPolicy(z.object({ options: rowSchema }))
    expect(left.ok && right.ok).toBe(true)
    if (!left.ok || !right.ok) return
    if (left.policy.kind !== 'deep' || right.policy.kind !== 'deep') {
      throw new Error('expected deep root policies')
    }
    expect(left.policy.fields.traits).toEqual(right.policy.fields.options)
  })
})
