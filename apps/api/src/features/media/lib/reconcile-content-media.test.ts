import { randomUUID } from 'node:crypto'

import { beforeEach, describe, expect, it } from 'vitest'

import { getContentMediaPolicy, resetPortraitCrop } from '@rpg/contracts'

import { setMongoTransactionsEnabled } from '../../../lib/mongo-transaction'
import { createMediaAssetRecord } from '../media.repository'
import { MediaAssetModel } from '../media-asset.model'
import { reconcileContentMedia } from './reconcile-content-media'
import { reclaimExpiredAssets } from './reclaim-expired-assets'
import { useIntegrationDb } from '../../../test/setup/integration-db'

useIntegrationDb()

async function seedAsset(input: {
  assetId?: string
  scopeKey?: string
  lifecycle?: 'ready' | 'expired' | 'deleting'
  referenceCount?: number
  leaseExpiresAt?: Date
}) {
  const assetId = input.assetId ?? randomUUID()
  await createMediaAssetRecord({
    _id: assetId,
    sessionId: randomUUID(),
    scopeKind: 'campaign-content',
    scopeKey: input.scopeKey ?? 'campaign-content:camp-1',
    campaignId: 'camp-1',
    createdByUserId: 'user-1',
    storageKey: `media/${assetId}/original.png`,
    originalFilename: 'sample.png',
    mimeType: 'image/png',
    byteSize: 128,
    orientedWidth: 512,
    orientedHeight: 512,
    contentHash: randomUUID(),
    animated: false,
    lifecycle: input.lifecycle ?? 'ready',
    referenceCount: input.referenceCount ?? 0,
    leaseExpiresAt: input.leaseExpiresAt ?? new Date(Date.now() + 60_000),
  })
  return assetId
}

describe('reconcileContentMedia', () => {
  beforeEach(() => {
    setMongoTransactionsEnabled(true)
  })

  it('replaces references, bumps revision, and preserves shared assets across subjects', async () => {
    const sharedAssetId = await seedAsset({})
    const soloAssetId = await seedAsset({})

    const subjectA = {
      kind: 'content' as const,
      id: 'record-a',
      scopeKey: 'campaign-content:camp-1',
    }
    const subjectB = {
      kind: 'content' as const,
      id: 'record-b',
      scopeKey: 'campaign-content:camp-1',
    }
    const scope = { kind: 'campaign-content' as const, campaignId: 'camp-1' }
    const policy = getContentMediaPolicy('class')

    const first = await reconcileContentMedia({
      subject: subjectA,
      scope,
      currentMedia: null,
      proposedMedia: {
        revision: 0,
        images: [{ id: 'img-1', assetId: sharedAssetId, alt: 'Shared' }],
        roles: { primary: { imageId: 'img-1' } },
      },
      policy,
    })
    expect(first.ok).toBe(true)

    await reconcileContentMedia({
      subject: subjectB,
      scope,
      currentMedia: null,
      proposedMedia: {
        revision: 0,
        images: [{ id: 'img-2', assetId: sharedAssetId, alt: 'Also shared' }],
        roles: { primary: { imageId: 'img-2' } },
      },
      policy,
    })

    const updated = await reconcileContentMedia({
      subject: subjectA,
      scope,
      currentMedia: first.ok ? first.media : null,
      expectedMediaRevision: first.ok ? first.media.revision : 0,
      proposedMedia: {
        revision: 0,
        images: [{ id: 'img-3', assetId: soloAssetId, alt: 'Solo' }],
        roles: { primary: { imageId: 'img-3' } },
      },
      policy,
    })

    expect(updated.ok).toBe(true)
    if (!updated.ok) return
    expect(updated.media.revision).toBe(2)

    const sharedDoc = await MediaAssetModel.findById(sharedAssetId).lean()
    expect(sharedDoc?.referenceCount).toBe(1)
  })

  it('returns stale revision conflicts without mutating references', async () => {
    const assetId = await seedAsset({ scopeKey: 'campaign-npc:camp-1' })
    const subject = { kind: 'character' as const, id: 'char-1', scopeKey: 'campaign-npc:camp-1' }
    const scope = { kind: 'campaign-npc' as const, campaignId: 'camp-1' }
    const policy = getContentMediaPolicy('character')

    const initial = await reconcileContentMedia({
      subject,
      scope,
      currentMedia: null,
      proposedMedia: {
        revision: 0,
        images: [{ id: 'img-1', assetId, alt: 'Portrait' }],
        roles: {
          portrait: {
            imageId: 'img-1',
            presentation: { crop: resetPortraitCrop({ width: 512, height: 512 }) },
          },
        },
      },
      policy,
    })
    expect(initial.ok).toBe(true)
    if (!initial.ok) return

    const conflict = await reconcileContentMedia({
      subject,
      scope,
      currentMedia: initial.media,
      expectedMediaRevision: 0,
      proposedMedia: {
        revision: 0,
        images: [{ id: 'img-2', assetId, alt: 'Other' }],
        roles: {
          portrait: {
            imageId: 'img-2',
            presentation: { crop: resetPortraitCrop({ width: 512, height: 512 }) },
          },
        },
      },
      policy,
    })

    expect(conflict).toEqual({ ok: false, reason: 'stale_revision', media: initial.media })
  })

  it('rejects assets claimed for deletion', async () => {
    const assetId = await seedAsset({ lifecycle: 'deleting' })
    const result = await reconcileContentMedia({
      subject: { kind: 'content', id: 'loc-1', scopeKey: 'campaign-content:camp-1' },
      scope: { kind: 'campaign-content', campaignId: 'camp-1' },
      currentMedia: null,
      proposedMedia: {
        revision: 0,
        images: [{ id: 'img-1', assetId, alt: 'Blocked' }],
        roles: { primary: { imageId: 'img-1' } },
      },
      policy: getContentMediaPolicy('location'),
    })

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.reason).toBe('asset_unavailable')
  })
})

describe('reclaimExpiredAssets', () => {
  it('reclaims expired unreferenced assets without requiring a browser cancel', async () => {
    const assetId = await seedAsset({
      lifecycle: 'ready',
      referenceCount: 0,
      leaseExpiresAt: new Date(Date.now() - 60_000),
    })

    const result = await reclaimExpiredAssets(new Date())
    expect(result.markedExpired).toBeGreaterThanOrEqual(1)
    expect(result.reclaimedAssetIds).toContain(assetId)

    const doc = await MediaAssetModel.findById(assetId).lean()
    expect(doc).toBeNull()
  })
})
