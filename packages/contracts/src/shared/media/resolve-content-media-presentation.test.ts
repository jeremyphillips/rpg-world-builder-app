import { describe, expect, it } from 'vitest'

import type { ContentMedia } from './content-media'
import { createUploadRoleAssignment } from './content-media-source'
import { resetPortraitCrop } from './geometry'
import { getContentMediaPolicy } from './media-policy'
import {
  resolveContentMediaPresentation,
  resolveContentMediaRolePresentation,
} from './resolve-content-media-presentation'

const assets = {
  'asset-landscape': { id: 'asset-landscape', orientedWidth: 1600, orientedHeight: 900 },
  'asset-square': { id: 'asset-square', orientedWidth: 512, orientedHeight: 512 },
}

function characterMedia(overrides: Partial<ContentMedia> = {}): ContentMedia {
  return {
    revision: 0,
    images: [{ id: 'img-1', assetId: 'asset-landscape', alt: 'Hero portrait' }],
    roles: {
      portrait: {
        ...createUploadRoleAssignment('img-1'),
        presentation: { mode: 'crop', crop: resetPortraitCrop({ width: 1600, height: 900 }) },
      },
      primary: createUploadRoleAssignment('img-1'),
    },
    ...overrides,
  }
}

describe('resolveContentMediaPresentation', () => {
  it('prefers portrait for compact character identity', () => {
    const resolved = resolveContentMediaPresentation({
      media: characterMedia(),
      policy: getContentMediaPolicy('character'),
      context: 'compact-identity',
      assetSummariesById: assets,
    })

    expect(resolved.kind).toBe('rendition')
    expect(resolved.role).toBe('portrait')
    expect(resolved.preset).toBe('compact-identity')
    expect(resolved.alt).toBe('Hero portrait')
    expect(resolved.fallbackReason).toBeUndefined()
  })

  it('falls back to a transient primary square without assigning portrait', () => {
    const resolved = resolveContentMediaPresentation({
      media: characterMedia({ roles: { primary: createUploadRoleAssignment('img-1') } }),
      policy: getContentMediaPolicy('character'),
      context: 'compact-identity',
      assetSummariesById: assets,
    })

    expect(resolved.kind).toBe('rendition')
    expect(resolved.role).toBeUndefined()
    expect(resolved.fallbackReason).toBe('primary-square-fallback')
    expect(resolved.crop).toEqual(resetPortraitCrop({ width: 1600, height: 900 }))
  })

  it('uses primary for full artwork and placeholders when assets are missing', () => {
    const artwork = resolveContentMediaPresentation({
      media: characterMedia({ roles: { primary: createUploadRoleAssignment('img-1') } }),
      policy: getContentMediaPolicy('class'),
      context: 'full-artwork',
      assetSummariesById: assets,
    })

    expect(artwork.role).toBe('primary')
    expect(artwork.preset).toBe('artwork')

    const missing = resolveContentMediaPresentation({
      media: characterMedia(),
      policy: getContentMediaPolicy('character'),
      context: 'compact-identity',
      assetSummariesById: {},
    })

    expect(missing.kind).toBe('placeholder')
    expect(missing.fallbackReason).toBe('missing-asset')
    expect(missing.alt).toBe('')
  })

  it('returns independent crops for two roles on one attachment', () => {
    const media = characterMedia({
      roles: {
        portrait: {
          ...createUploadRoleAssignment('img-1'),
          presentation: { mode: 'crop', crop: { x: 0.1, y: 0.2, width: 0.5, height: 0.5 } },
        },
        primary: {
          ...createUploadRoleAssignment('img-1'),
          presentation: { mode: 'crop', crop: { x: 0, y: 0, width: 1, height: 1 } },
        },
      },
    })

    const portrait = resolveContentMediaRolePresentation({
      media,
      role: 'portrait',
      preset: 'portrait',
      assetSummariesById: assets,
    })
    const primary = resolveContentMediaRolePresentation({
      media,
      role: 'primary',
      preset: 'artwork',
      assetSummariesById: assets,
    })

    expect(portrait?.crop).toEqual({ x: 0.1, y: 0.2, width: 0.5, height: 0.5 })
    expect(primary?.crop).toEqual({ x: 0, y: 0, width: 1, height: 1 })
  })
})
