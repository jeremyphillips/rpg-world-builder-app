import { describe, expect, it } from 'vitest'

import { createUploadRoleAssignment } from './content-media-source'
import { contentTypeSubject } from './system-image-subject'
import { resolveAvailableContentMediaSources } from './resolve-available-content-media-sources'
import {
  resolveEffectiveImageRoles,
  resolveEffectiveRepresentativeImageId,
} from './resolve-effective-image-roles'

const systemContext = {
  domain: 'class' as const,
  subject: contentTypeSubject('classes'),
  slug: 'fighter',
  contentSource: 'system' as const,
  rulesetId: 'srd-cc-5.2.1',
}

const uploadImage = { id: 'upload-1', assetId: 'asset-1' }

function sourcesFor(media: Parameters<typeof resolveAvailableContentMediaSources>[0]['media']) {
  return resolveAvailableContentMediaSources({ media, ...systemContext }).sources
}

describe('resolveEffectiveImageRoles', () => {
  it('derives primary on the system tile only when primary is unassigned', () => {
    const media = { revision: 0, images: [uploadImage], roles: {} }
    expect(
      resolveEffectiveImageRoles(
        media,
        sourcesFor(media).find((s) => s.sourceKind === 'system')!.id,
        ['primary'],
        sourcesFor(media),
      ),
    ).toEqual({ roles: ['primary'], derivedRoles: ['primary'] })
  })

  it('does not derive primary on the system tile when primary is assigned elsewhere', () => {
    const media = {
      revision: 0,
      images: [uploadImage],
      roles: { primary: createUploadRoleAssignment('upload-1') },
    }
    const sources = sourcesFor(media)
    expect(
      resolveEffectiveImageRoles(
        media,
        sources.find((s) => s.sourceKind === 'system')!.id,
        ['primary'],
        sources,
      ),
    ).toEqual({ roles: [], derivedRoles: [] })
  })
})

describe('resolveEffectiveRepresentativeImageId', () => {
  it('prefers the image that effectively owns the first representative role', () => {
    const unassigned = { revision: 0, images: [uploadImage], roles: {} }
    const unassignedSources = sourcesFor(unassigned)
    expect(resolveEffectiveRepresentativeImageId(unassigned, ['primary'], unassignedSources)).toBe(
      unassignedSources.find((s) => s.sourceKind === 'system')!.id,
    )

    const assigned = {
      revision: 0,
      images: [uploadImage],
      roles: { primary: createUploadRoleAssignment('upload-1') },
    }
    expect(resolveEffectiveRepresentativeImageId(assigned, ['primary'], sourcesFor(assigned))).toBe(
      'upload-1',
    )
  })

  it('does not fall back to the first gallery upload when no role applies', () => {
    const media = {
      revision: 0,
      images: [uploadImage],
      roles: {},
    }
    const homebrewSources = resolveAvailableContentMediaSources({
      media,
      domain: 'class',
      contentSource: 'homebrew',
    }).sources
    expect(
      resolveEffectiveRepresentativeImageId(media, ['primary'], homebrewSources),
    ).toBeUndefined()
  })
})
