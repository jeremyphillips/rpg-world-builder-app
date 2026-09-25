import { describe, expect, it } from 'vitest'

import {
  CONTENT_MEDIA_REPLACE_KEY,
  createUploadRoleAssignment,
  emptyContentMediaSchema,
} from '@rpg/contracts'

import { deepMerge } from './deep-merge'

describe('deepMerge', () => {
  it('deep-merges nested plain objects', () => {
    const base = { a: 1, nested: { x: 1, y: 2 } }
    const result = deepMerge(base, { nested: { y: 20, z: 30 } })
    expect(result).toEqual({ a: 1, nested: { x: 1, y: 20, z: 30 } })
  })

  it('replaces arrays wholesale (does not merge element-wise)', () => {
    const base = { items: [1, 2, 3] }
    expect(deepMerge(base, { items: [9] })).toEqual({ items: [9] })
  })

  it('replaces primitives and skips undefined patch values', () => {
    const base = { a: 1, b: 2 }
    expect(deepMerge(base, { a: 5, b: undefined })).toEqual({ a: 5, b: 2 })
  })

  it('does not mutate the base object', () => {
    const base = { nested: { x: 1 } }
    deepMerge(base, { nested: { x: 99 } })
    expect(base.nested.x).toBe(1)
  })

  it('removes keys when the patch value is null', () => {
    const base = { a: 1, resolution: { method: { kind: 'attack' } } }
    expect(deepMerge(base, { resolution: null })).toEqual({ a: 1 })
  })

  it('replaces listed keys wholesale instead of deep-merging objects', () => {
    const base = {
      resolution: {
        selectionMode: 'targets',
        method: { kind: 'attack', attackType: 'ranged-spell' },
        effects: [{ id: 'damage', kind: 'damage' }],
      },
    }
    const patch = {
      resolution: {
        selectionMode: 'self',
        method: { kind: 'automatic' },
        effects: [{ id: 'healing', kind: 'healing' }],
        outcomes: [{ result: 'applied', applications: [] }],
      },
    }

    expect(deepMerge(base, patch, { replaceKeys: ['resolution'] }).resolution).toEqual(
      patch.resolution,
    )
  })

  it('replaces media wholesale for overlay patches', () => {
    const base = {
      media: {
        revision: 0,
        images: [{ id: 'img-base', assetId: 'asset-base', alt: 'Base art' }],
        roles: {
          primary: createUploadRoleAssignment('img-base'),
          portrait: createUploadRoleAssignment('img-base'),
        },
      },
    }
    const patch = {
      media: {
        revision: 0,
        images: [{ id: 'img-patch', assetId: 'asset-patch', alt: 'Patch art' }],
        roles: { primary: createUploadRoleAssignment('img-patch') },
      },
    }

    expect(deepMerge(base, patch, { replaceKeys: [CONTENT_MEDIA_REPLACE_KEY] }).media).toEqual(
      patch.media,
    )
  })

  it('inherits overlay media when omitted and clears roles with an empty media object', () => {
    const base = {
      media: {
        revision: 0,
        images: [{ id: 'img-base', assetId: 'asset-base' }],
        roles: {
          primary: createUploadRoleAssignment('img-base'),
          portrait: createUploadRoleAssignment('img-base'),
        },
      },
    }

    expect(deepMerge(base, {}, { replaceKeys: [CONTENT_MEDIA_REPLACE_KEY] }).media).toEqual(
      base.media,
    )

    expect(
      deepMerge(
        base,
        { media: emptyContentMediaSchema },
        { replaceKeys: [CONTENT_MEDIA_REPLACE_KEY] },
      ).media,
    ).toEqual(emptyContentMediaSchema)
  })
})
