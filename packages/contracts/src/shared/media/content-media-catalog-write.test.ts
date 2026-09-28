import { describe, expect, it } from 'vitest'

import {
  collectContentMediaCoherenceIssues,
  hasAuthoredContentMediaForCatalogWrite,
  normalizeContentMediaForCatalogPersist,
  prepareContentMediaForCatalogWrite,
  repairContentMediaForRead,
} from './content-media-catalog-write'
import { contentMediaSchema, emptyContentMediaSchema } from './content-media'
import { createUploadRoleAssignment } from './content-media-source'
import { contentTypeSubject } from './system-image-subject'
import { getContentMediaPolicy } from './media-policy'
import { validateContentMediaForCatalogWrite } from './content-media-catalog-write'

const classWriteCtx = {
  domain: 'class' as const,
  subject: contentTypeSubject('classes'),
  slug: 'fighter',
  contentSource: 'system' as const,
  rulesetId: 'srd-cc-5.2.1',
}

describe('prepareContentMediaForCatalogWrite', () => {
  it('accepts gallery-only media', () => {
    const media = prepareContentMediaForCatalogWrite({
      revision: 0,
      images: [{ id: 'img-1', assetId: 'asset-1' }],
      roles: {},
    })
    expect(media.images).toHaveLength(1)
  })
})

describe('collectContentMediaCoherenceIssues', () => {
  it('rejects orphan upload roles', () => {
    const media = contentMediaSchema.parse({
      revision: 0,
      images: [],
      roles: { primary: createUploadRoleAssignment('missing-id') },
    })
    const issues = collectContentMediaCoherenceIssues(media)
    expect(issues.some((issue) => issue.path.join('.') === 'roles.primary.source')).toBe(true)
  })
})

describe('validateContentMediaForCatalogWrite', () => {
  it('rejects incoherent media before policy checks', () => {
    const media = contentMediaSchema.parse({
      revision: 0,
      images: [],
      roles: { primary: createUploadRoleAssignment('ghost') },
    })
    const result = validateContentMediaForCatalogWrite(media, {
      policy: getContentMediaPolicy('class'),
      assetDimensionsById: {},
    })
    expect(result.ok).toBe(false)
  })
})

describe('hasAuthoredContentMediaForCatalogWrite', () => {
  it('treats gallery-only uploads as authored', () => {
    expect(
      hasAuthoredContentMediaForCatalogWrite({
        revision: 0,
        images: [{ id: 'img-1', assetId: 'asset-1' }],
        roles: {},
      }),
    ).toBe(true)
  })

  it('does not treat untouched derived system primary as authored', () => {
    const derived = normalizeContentMediaForCatalogPersist(emptyContentMediaSchema, classWriteCtx)
    expect(hasAuthoredContentMediaForCatalogWrite(derived, classWriteCtx)).toBe(false)
  })
})

describe('repairContentMediaForRead', () => {
  it('prunes orphan upload roles in explicit repair mode', () => {
    const repaired = repairContentMediaForRead(
      contentMediaSchema.parse({
        revision: 0,
        images: [],
        roles: { primary: createUploadRoleAssignment('ghost') },
      }),
    )
    expect(repaired.roles.primary).toBeUndefined()
  })
})

describe('normalizeContentMediaForCatalogPersist', () => {
  it('may omit untouched system primary on system content', () => {
    const withSystemPrimary = contentMediaSchema.parse({
      revision: 0,
      images: [],
      roles: {
        primary: {
          source: {
            kind: 'system',
            imageSetId: 'srd-cc-5.2.1',
            subject: contentTypeSubject('classes'),
            assetRole: 'primary',
            slug: 'fighter',
          },
        },
      },
    })
    const normalized = normalizeContentMediaForCatalogPersist(withSystemPrimary, classWriteCtx)
    expect(normalized.roles.primary).toBeUndefined()
  })
})
