import { describe, expect, it } from 'vitest'

import { createUploadRoleAssignment, createSystemRoleAssignment } from './content-media-source'
import { contentTypeSubject, vocabularySetSubject } from './system-image-subject'
import type { AvailableContentImage } from './get-available-content-images'
import {
  resolveEffectiveImageRoles,
  resolveEffectiveRepresentativeImageId,
} from './resolve-effective-image-roles'

const systemImage: AvailableContentImage = {
  kind: 'system',
  id: 'system:srd:content-type:classes:primary:fighter',
  source: {
    kind: 'system',
    imageSetId: 'srd',
    subject: contentTypeSubject('classes'),
    assetRole: 'primary',
    slug: 'fighter',
  },
  srcPath: '/assets/classes/fighter.png',
  sourceDimensions: { width: 800, height: 600 },
}

const uploadImage: AvailableContentImage = {
  kind: 'upload',
  id: 'upload-1',
  attachment: { id: 'upload-1', assetId: 'asset-1' },
}

describe('resolveEffectiveImageRoles', () => {
  it('derives primary on the system tile only when primary is unassigned', () => {
    expect(
      resolveEffectiveImageRoles(
        { revision: 0, images: [uploadImage.attachment], roles: {} },
        systemImage.id,
        ['primary'],
        [uploadImage, systemImage],
      ),
    ).toEqual({ roles: ['primary'], derivedRoles: ['primary'] })
  })

  it('does not derive primary on the system tile when primary is assigned elsewhere', () => {
    expect(
      resolveEffectiveImageRoles(
        {
          revision: 0,
          images: [uploadImage.attachment],
          roles: { primary: createUploadRoleAssignment('upload-1') },
        },
        systemImage.id,
        ['primary'],
        [uploadImage, systemImage],
      ),
    ).toEqual({ roles: [], derivedRoles: [] })
  })

  it('derives emblem on the system tile when emblem is unassigned', () => {
    const emblemSystemImage: AvailableContentImage = {
      kind: 'system',
      id: 'system:srd:spell-schools:emblem:evocation',
      source: {
        kind: 'system',
        imageSetId: 'srd-cc-5.2.1',
        subject: vocabularySetSubject('spell-schools'),
        assetRole: 'emblem',
        slug: 'evocation',
      },
      srcPath: '/assets/system/srd-cc-5.2.1/spell-schools/emblem/evocation.png',
      sourceDimensions: { width: 1254, height: 1254 },
    }

    expect(
      resolveEffectiveImageRoles(
        { revision: 0, images: [], roles: {} },
        emblemSystemImage.id,
        ['emblem'],
        [emblemSystemImage],
      ),
    ).toEqual({ roles: ['emblem'], derivedRoles: ['emblem'] })
  })

  it('returns explicit upload and system role ownership without derivation', () => {
    expect(
      resolveEffectiveImageRoles(
        {
          revision: 0,
          images: [uploadImage.attachment],
          roles: { primary: createUploadRoleAssignment('upload-1') },
        },
        'upload-1',
        ['primary'],
        [uploadImage, systemImage],
      ),
    ).toEqual({ roles: ['primary'], derivedRoles: [] })

    expect(
      resolveEffectiveImageRoles(
        {
          revision: 0,
          images: [],
          roles: {
            primary: createSystemRoleAssignment({
              imageSetId: 'srd',
              subject: contentTypeSubject('classes'),
              assetRole: 'primary',
              slug: 'fighter',
            }),
          },
        },
        systemImage.id,
        ['primary'],
        [systemImage],
      ),
    ).toEqual({ roles: ['primary'], derivedRoles: [] })
  })
})

describe('resolveEffectiveRepresentativeImageId', () => {
  it('prefers the image that effectively owns the first representative role', () => {
    expect(
      resolveEffectiveRepresentativeImageId(
        { revision: 0, images: [uploadImage.attachment], roles: {} },
        ['primary'],
        [uploadImage, systemImage],
      ),
    ).toBe(systemImage.id)

    expect(
      resolveEffectiveRepresentativeImageId(
        {
          revision: 0,
          images: [uploadImage.attachment],
          roles: { primary: createUploadRoleAssignment('upload-1') },
        },
        ['primary'],
        [uploadImage, systemImage],
      ),
    ).toBe('upload-1')
  })
})
