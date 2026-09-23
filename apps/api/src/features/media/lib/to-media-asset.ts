import type { MediaAsset, MediaScope } from '@rpg/contracts'

import type { MediaAssetDoc } from '../media-asset.model'

export function toMediaAsset(doc: MediaAssetDoc): MediaAsset {
  return {
    id: doc._id,
    filename: doc.originalFilename,
    mimeType: doc.mimeType,
    byteSize: doc.byteSize,
    orientedWidth: doc.orientedWidth,
    orientedHeight: doc.orientedHeight,
    contentHash: doc.contentHash,
    animated: doc.animated,
    lifecycle: doc.lifecycle,
    createdAt: doc.createdAt.toISOString(),
  }
}

export function scopeFromDoc(doc: {
  scopeKind: string
  campaignId?: string | null
  userId?: string | null
}): MediaScope {
  switch (doc.scopeKind) {
    case 'campaign-content':
      return { kind: 'campaign-content', campaignId: doc.campaignId ?? '' }
    case 'campaign-npc':
      return { kind: 'campaign-npc', campaignId: doc.campaignId ?? '' }
    case 'user-pc':
      return { kind: 'user-pc', userId: doc.userId ?? '' }
    default:
      throw new Error(`Unknown media scope kind: ${doc.scopeKind}`)
  }
}
